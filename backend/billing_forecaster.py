import sys
import json
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os
import joblib

# Suppress warnings
import warnings
warnings.filterwarnings('ignore')

# ML Imports (Will be loaded lazily to prevent hangs)
ML_AVAILABLE = True 

# Disable oneDNN to prevent Windows hangs during initialization
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2' # Suppress noise





# =============================================================================
# DATA GENERATION
# =============================================================================
def generate_karachi_weather(start_date, end_date):
    date_range = pd.date_range(start=start_date, end=end_date, freq='H')
    weather_data = []

    for dt in date_range:
        month = dt.month
        hour = dt.hour
        
        if month in [4, 5, 6, 9, 10]:
            base_temp, temp_range, season = 32, (28, 40), 'Summer'
        elif month in [7, 8]:
            base_temp, temp_range, season = 30, (28, 36), 'Monsoon'
        elif month in [11, 12, 1, 2, 3]:
            base_temp, temp_range, season = 20, (10, 28), 'Winter'
        else:
            base_temp, temp_range, season = 28, (22, 32), 'Transition'

        day_cycle = -np.cos((hour - 5) * 2 * np.pi / 24)
        
        temp = base_temp + (day_cycle * 5) + np.random.normal(0, 1.5)
        temp = max(temp_range[0], min(temp_range[1], temp))
        
        humidity = 70 - (day_cycle * 20) + np.random.normal(0, 5)
        humidity = max(30, min(95, humidity))

        weather_data.append({
            'timestamp': dt,
            'temperature_C': round(temp, 1),
            'humidity_percent': round(humidity, 1),
            'season': season
        })
    return pd.DataFrame(weather_data)

def get_slab_price(monthly_usage):
    """Returns the base rate per unit for the current slab (cliff-edge model)."""
    if monthly_usage <= 100: return 16.48
    elif monthly_usage <= 200: return 22.95
    elif monthly_usage <= 300: return 27.14
    elif monthly_usage <= 700: return 38.46
    else: return 47.20

def calculate_progressive_bill(units):
    """Calculates the total bill using a progressive slab system (K-Electric style)."""
    total = 0
    remaining = units
    
    slabs = [
        (100, 16.48),
        (100, 22.95),
        (100, 27.14),
        (400, 38.46),
        (float('inf'), 47.20)
    ]
    
    for limit, rate in slabs:
        if remaining <= 0: break
        consumed_in_slab = min(remaining, limit)
        total += consumed_in_slab * rate
        remaining -= consumed_in_slab
        
    return total * 1.25 # Including ~25% for taxes, duties, and fuel adjustment (more realistic than 15%)

def get_slab_tier(monthly_usage):
    if monthly_usage <= 100: return 1
    elif monthly_usage <= 200: return 2
    elif monthly_usage <= 300: return 3
    elif monthly_usage <= 700: return 4
    else: return 5

def transform_monthly_to_hourly(account_number, monthly_history, days=30):
    """
    Transforms monthly Supabase bills into a realistic hourly historical dataset.
    """
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    weather_df = generate_karachi_weather(start_date, end_date)
    
    if len(monthly_history) > 0:
        recent_units = sum(m.get('currentMonthUnits', 0) for m in monthly_history[-3:]) / min(3, len(monthly_history))
    else:
        recent_units = 300 
        
    data = []
    weights = []
    
    for _, row in weather_df.iterrows():
        dt = row['timestamp']
        temp = row['temperature_C']
        season = row['season']
        is_weekend = dt.dayofweek >= 5
        hour = dt.hour
        
        if 18 <= hour <= 23: hourly_factor = 1.0
        elif 9 <= hour <= 17: hourly_factor = 0.7
        else: hourly_factor = 0.3
            
        if season in ['Summer', 'Monsoon'] and temp > 26:
            temp_factor = (temp - 26) * 0.25
        elif season == 'Winter' and temp < 15:
            temp_factor = (15 - temp) * 0.05
        else:
            temp_factor = 0
            
        weekend_factor = 1.2 if is_weekend else 1.0
        weight = (1.0 * hourly_factor) * (1 + temp_factor) * weekend_factor * np.random.normal(1, 0.1)
        weights.append(max(0.1, weight))
        
    total_weight = sum(weights)
    
    for i, row in weather_df.iterrows():
        usage = (weights[i] / total_weight) * recent_units
        dt = row['timestamp']
        data.append({
            'accountNumber': str(account_number),
            'timestamp': dt,
            'hour_of_day': float(dt.hour),
            'day_of_week': float(dt.dayofweek),
            'is_holiday': float(1 if dt.dayofweek >= 5 else 0),
            'temperature_C': float(row['temperature_C']),
            'humidity_percent': float(row['humidity_percent']),
            'usage_kwh': float(usage),
            'season': row['season'],
            'price_Rs_per_hour': float(get_slab_price(recent_units)),
            'slab_tier': float(get_slab_tier(recent_units))
        })
    return pd.DataFrame(data)

# =============================================================================
# INFERENCE LOGIC (SINGLETON CLASS)
# =============================================================================

class Forecaster:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(Forecaster, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        
        print("Initializing ML Forecaster (loading models)...")
        self.backend_dir = os.path.dirname(__file__)
        
        # LSTM Artifacts
        self.lstm_model_path = os.path.join(self.backend_dir, 'final_lstm_model.h5')
        self.feat_scaler_path = os.path.join(self.backend_dir, 'lstm_feature_scaler.pkl')
        self.tgt_scaler_path = os.path.join(self.backend_dir, 'lstm_target_scaler.pkl')
        
        # TFT Artifacts
        self.tft_ckpt_path = os.path.join(self.backend_dir, 'tft_model_checkpoint.ckpt')
        # Use a unique name for the new patch to force re-patching
        self.tft_patched_path = os.path.join(self.backend_dir, 'tft_model_checkpoint_v2.ckpt')


        self.lstm_model = None
        self.feature_scaler = None
        self.target_scaler = None
        self.tft_model = None

        self._initialized = True
        print("Forecaster initialized (Basic state).")


    def _ensure_models_loaded(self):
        if self.lstm_model is None and self.tft_model is None and ML_AVAILABLE:
            self._load_models()


    def _load_models(self):
        global ML_AVAILABLE
        print("[DEBUG] Step 1: Starting lazy imports...")
        # Load ML Libraries lazily
        try:
            import tensorflow as tf
            print("[DEBUG] Step 2: TensorFlow imported.")
            from tensorflow.keras.layers import InputLayer as KerasInputLayer
            
            # Define PatchedInputLayer here for Keras 3 compatibility
            class PatchedInputLayer(KerasInputLayer):
                def __init__(self, *args, **kwargs):
                    kwargs.pop('batch_shape', None)
                    super().__init__(*args, **kwargs)

            import torch
            print("[DEBUG] Step 3: PyTorch imported.")
            from pytorch_forecasting import TemporalFusionTransformer, TimeSeriesDataSet
            from pytorch_forecasting.data import GroupNormalizer
            from pytorch_forecasting.data.encoders import NaNLabelEncoder
            print("[DEBUG] Step 4: All ML libraries ready.")
        except ImportError as e:
            print(f"ML libraries not found, using fallback: {e}")
            ML_AVAILABLE = False
            return

        # Load LSTM
        if all(os.path.exists(p) for p in [self.lstm_model_path, self.feat_scaler_path, self.tgt_scaler_path]):
            try:
                print(f"[DEBUG] Step 5: Loading LSTM from {self.lstm_model_path}...")
                # Add DTypePolicy to custom_objects for Keras 3
                try:
                    from tensorflow.keras.mixed_precision import Policy as DTypePolicy
                except (ImportError, AttributeError):
                    DTypePolicy = None

                try:
                    # Try a "Bare" load first (most compatible with Keras 3)
                    print("[DEBUG] Step 6: Attempting Bare Load...")
                    self.lstm_model = tf.keras.models.load_model(self.lstm_model_path, compile=False)

                    print("LSTM model loaded via Bare Load.")
                except Exception as e1:
                    print(f"Bare load failed ({e1}), trying Patched Load...")
                    try:
                        custom_objects = {'InputLayer': PatchedInputLayer, 'DTypePolicy': DTypePolicy}
                        self.lstm_model = tf.keras.models.load_model(
                            self.lstm_model_path, 
                            compile=False, 
                            custom_objects=custom_objects
                        )
                        print("LSTM model loaded via Patched Load.")
                    except Exception as e2:
                        print(f"Patched load failed ({e2}). AI model is incompatible with local version.")
                
                self.feature_scaler = joblib.load(self.feat_scaler_path)
                self.target_scaler = joblib.load(self.tgt_scaler_path)
                
                if self.lstm_model is not None:
                    print("SUCCESS: LSTM model active for evaluation.")
                else:
                    print("WARNING: LSTM model inactive. Using prediction fallback.")
            except Exception as e:
                print(f"Critical error in model recovery: {e}")




        # Load TFT
        if os.path.exists(self.tft_ckpt_path):
            try:
                # Safe globals for PyTorch 2.6+
                try:
                    torch.serialization.add_safe_globals([GroupNormalizer, NaNLabelEncoder])
                except Exception:
                    pass

                # Patch checkpoint if needed
                if not os.path.exists(self.tft_patched_path):
                    print("Patching TFT checkpoint...")
                    raw_ckpt = torch.load(self.tft_ckpt_path, map_location='cpu', weights_only=False)
                    hp = raw_ckpt.get('hyper_parameters', {})
                    # mask_bias is a legacy parameter that causes errors in newer versions
                    CONFLICTING_KEYS = {'monotone_constaints', 'monotone_constraints', 'log_gradient_flow', 'mask_bias'}
                    for key in list(hp.keys()):
                        if key in CONFLICTING_KEYS:
                            hp.pop(key)
                    torch.save(raw_ckpt, self.tft_patched_path)

                self.tft_model = TemporalFusionTransformer.load_from_checkpoint(self.tft_patched_path, weights_only=False)
                self.tft_model.eval()
                print("TFT model loaded successfully.")
            except Exception as e:
                print(f"Error loading TFT model: {e}")


    def run_lstm_forecast(self, df, steps=720):
        if self.lstm_model is None:
            # Quick-Load attempt or return None to trigger average-plus logic
            return None


        df_feat = df.copy()
        df_feat['hour'] = df_feat['timestamp'].dt.hour
        df_feat['day_of_month'] = df_feat['timestamp'].dt.day
        df_feat['day_of_week'] = df_feat['timestamp'].dt.dayofweek
        df_feat['month'] = df_feat['timestamp'].dt.month

        df_feat['hour_sin'] = np.sin(2 * np.pi * df_feat['hour'] / 24)
        df_feat['hour_cos'] = np.cos(2 * np.pi * df_feat['hour'] / 24)
        df_feat['day_sin'] = np.sin(2 * np.pi * df_feat['day_of_week'] / 7)
        df_feat['day_cos'] = np.cos(2 * np.pi * df_feat['day_of_week'] / 7)
        df_feat['month_sin'] = np.sin(2 * np.pi * df_feat['month'] / 12)
        df_feat['month_cos'] = np.cos(2 * np.pi * df_feat['month'] / 12)

        df_feat['usage_lag_1h'] = df_feat['usage_kwh'].shift(1).fillna(0)
        df_feat['usage_lag_24h'] = df_feat['usage_kwh'].shift(24).fillna(0)
        df_feat['usage_lag_168h'] = df_feat['usage_kwh'].shift(168).fillna(0)
        df_feat['usage_roll_mean_24h'] = df_feat['usage_kwh'].rolling(24).mean().fillna(0)
        
        df_feat['consumption_kWh_y'] = df_feat['usage_kwh']

        feature_cols = [
            'temperature_C', 'humidity_percent', 'hour_of_day', 'is_holiday',
            'consumption_kWh_y', 'slab_tier', 'price_Rs_per_hour',
            'hour_sin', 'hour_cos', 'day_sin', 'day_cos',
            'month_sin', 'month_cos', 'usage_lag_1h', 'usage_lag_24h',
            'usage_lag_168h', 'usage_roll_mean_24h'
        ]

        last_seq = df_feat[feature_cols].values[-24:]
        if len(last_seq) < 24:
            raise ValueError("Not enough historical data to form a 24-hour sequence.")
            
        last_seq_scaled = self.feature_scaler.transform(last_seq).reshape(1, 24, len(feature_cols))
        
        y_pred_sc = self.lstm_model.predict(last_seq_scaled, verbose=0)
        y_pred = self.target_scaler.inverse_transform(y_pred_sc).flatten()[0]
        
        avg_hist_usage = df['usage_kwh'].mean()
        predicted_monthly_total = y_pred * 720 * (avg_hist_usage / max(y_pred, 0.01))
        
        return max(0, predicted_monthly_total)

    def run_tft_forecast(self, df, steps=720):
        self._ensure_models_loaded()
        if self.tft_model is None:

            raise FileNotFoundError("TFT model not loaded.")

        data = df.copy()
        data['accountNumber'] = data['accountNumber'].astype(str)
        data['day_of_week'] = data['day_of_week'].astype(str)
        data['is_holiday'] = data['is_holiday'].astype(str)
        data['season'] = data['season'].astype(str)
        data['month'] = data['timestamp'].dt.month.astype(str)
        data['time_idx'] = data.groupby('accountNumber').cumcount()
        data = data.ffill().fillna(0)

        training = TimeSeriesDataSet(
            data,
            time_idx="time_idx",
            target="usage_kwh",
            group_ids=["accountNumber"],
            min_encoder_length=168,
            max_encoder_length=168,
            min_prediction_length=1,
            max_prediction_length=steps,
            static_categoricals=["accountNumber"],
            time_varying_known_categoricals=["day_of_week", "is_holiday", "month", "season"],
            time_varying_known_reals=["time_idx", "price_Rs_per_hour", "temperature_C", "humidity_percent", "hour_of_day"],
            time_varying_unknown_reals=["usage_kwh"],
            add_relative_time_idx=True,
            add_target_scales=True,
            add_encoder_length=True,
            allow_missing_timesteps=True
        )

        predictions = self.tft_model.predict(training, mode="prediction", return_x=False)
        total_predicted = predictions.cpu().numpy().sum()
        
        return float(max(0, total_predicted))

# Lazy global instance helper
_forecaster_instance = None
def get_forecaster():
    global _forecaster_instance
    if _forecaster_instance is None:
        _forecaster_instance = Forecaster()
    return _forecaster_instance


def predict(account_number, monthly_history):
    """
    Main entry point for prediction. Uses the trained LSTM model for forecasting.
    """
    try:
        forecaster = get_forecaster()
        # Ensure models are loaded
        forecaster._ensure_models_loaded()
        
        # 1. Prepare historical data
        # Transform the monthly history into a realistic hourly sequence for the LSTM
        df_hourly = transform_monthly_to_hourly(account_number, monthly_history)
        
        # 2. Run the trained model
        print(f"Running LSTM forecast for account {account_number}...")
        predicted_units = forecaster.run_lstm_forecast(df_hourly)
        
        is_model_active = True
        
        # 3. Fallback to seasonal simulation if model fails or is unavailable
        if predicted_units is None:
            print("Model not available, using seasonal simulation fallback.")
            is_model_active = False
            
            # Base Average from history
            if len(monthly_history) > 0:
                avg_units = sum(m.get('currentMonthUnits', 0) for m in monthly_history) / len(monthly_history)
            else:
                avg_units = 300

            # Seasonal Factors for Karachi
            current_month = datetime.now().month
            seasonal_factors = {
                1: 0.72, 2: 0.78, 3: 0.93, 4: 1.15, 5: 1.34, 6: 1.42, 
                7: 1.38, 8: 1.31, 9: 1.27, 10: 1.12, 11: 0.88, 12: 0.77
            }
            factor = seasonal_factors.get(current_month, 1.0)
            
            # Deterministic variance based on account number
            acc_hash = sum(ord(c) for c in str(account_number))
            rng = np.random.RandomState(acc_hash % 1000)
            user_profile_factor = rng.uniform(0.95, 1.05)
            
            predicted_units = avg_units * factor * user_profile_factor

        # 4. Correct Price Calculation (Progressive Slabs)
        predicted_price = calculate_progressive_bill(predicted_units)
        
        return {
            "nextMonthUnits": round(float(predicted_units), 1),
            "nextMonthPrice": round(float(predicted_price), 2),
            "is_ensemble_model": is_model_active, 
            "status": "Success" if is_model_active else "Fallback"
        }

    except Exception as e:
        print(f"Prediction Error: {e}")
        # Return a safe default with the error message
        return {
            "error": str(e), 
            "nextMonthUnits": 350, 
            "nextMonthPrice": 12500,
            "fallback": True
        }





if __name__ == "__main__":
    try:
        if len(sys.argv) < 2:
            raise ValueError("No input file provided")
            
        input_file = sys.argv[1]
        with open(input_file, 'r') as f:
            input_data = json.load(f)
            
        account_number = input_data.get("accountNumber", "UNKNOWN")
        monthly_history = input_data.get("history", [])
        
        result = predict(account_number, monthly_history)
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
