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

# ML Imports (Will fail gracefully if not installed)
try:
    import tensorflow as tf
    # Fix for Keras 3 batch_shape error
    from tensorflow.keras.layers import InputLayer as KerasInputLayer
    class PatchedInputLayer(KerasInputLayer):
        def __init__(self, *args, **kwargs):
            kwargs.pop('batch_shape', None)
            super().__init__(*args, **kwargs)

    import torch
    from pytorch_forecasting import TemporalFusionTransformer, TimeSeriesDataSet
    from pytorch_forecasting.data import GroupNormalizer
    from pytorch_forecasting.data.encoders import NaNLabelEncoder
    ML_AVAILABLE = True
except ImportError:
    ML_AVAILABLE = False



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
    if monthly_usage <= 100: return 15.0
    elif monthly_usage <= 200: return 22.0
    elif monthly_usage <= 300: return 28.0
    elif monthly_usage <= 700: return 35.0
    else: return 45.0

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

        if ML_AVAILABLE:
            self._load_models()
        
        self._initialized = True

    def _load_models(self):
        # Load LSTM
        if all(os.path.exists(p) for p in [self.lstm_model_path, self.feat_scaler_path, self.tgt_scaler_path]):
            try:
                # Add DTypePolicy to custom_objects for Keras 3
                try:
                    from tensorflow.keras.mixed_precision import Policy as DTypePolicy
                except ImportError:
                    DTypePolicy = None

                custom_objects = {
                    'InputLayer': PatchedInputLayer,
                    'DTypePolicy': DTypePolicy
                }
                
                self.lstm_model = tf.keras.models.load_model(
                    self.lstm_model_path, 
                    compile=False, 
                    custom_objects=custom_objects
                )
                self.feature_scaler = joblib.load(self.feat_scaler_path)
                self.target_scaler = joblib.load(self.tgt_scaler_path)
                print("LSTM model and scalers loaded successfully.")
            except Exception as e:
                print(f"Error loading LSTM model: {e}")

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
        if self.lstm_model is None or self.feature_scaler is None or self.target_scaler is None:
            raise FileNotFoundError("LSTM model or scalers not loaded.")

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

# Global instance
forecaster = Forecaster()

def predict(account_number, monthly_history):
    # 1. Transform Monthly to Hourly
    hourly_df = transform_monthly_to_hourly(account_number, monthly_history, days=30)
    
    try:
        if not ML_AVAILABLE:
            raise ImportError("Machine Learning libraries (tensorflow, torch) are not installed.")
            
        # Run LSTM
        lstm_monthly_units = forecaster.run_lstm_forecast(hourly_df, steps=720)
        
        # Run TFT
        tft_monthly_units = forecaster.run_tft_forecast(hourly_df, steps=720)

        
        # Blend based on inverse MAE weights
        LSTM_WEIGHT = 0.951
        TFT_WEIGHT = 0.049
        
        blended_units = (lstm_monthly_units * LSTM_WEIGHT) + (tft_monthly_units * TFT_WEIGHT)
        predicted_price = blended_units * get_slab_price(blended_units) * 1.15 # including 15% tax
        
        return {
            "nextMonthUnits": round(blended_units),
            "nextMonthPrice": round(predicted_price, 2),
            "is_ensemble_model": True
        }
    except Exception as e:
        # Fallback to simple average if ML fails
        print(f"ML Model Inference Failed: {str(e)}. Falling back to average.")
        if len(monthly_history) > 0:
            avg_units = sum(m.get('currentMonthUnits', 0) for m in monthly_history) / len(monthly_history)
        else:
            avg_units = 300
        
        predicted_price = avg_units * get_slab_price(avg_units) * 1.15
        return {
            "nextMonthUnits": round(avg_units),
            "nextMonthPrice": round(predicted_price, 2),
            "is_ensemble_model": False,
            "fallback": True,
            "error": str(e)
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
