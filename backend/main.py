from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import json
import uvicorn
import logging
from billing_forecaster import predict
from recommender import generate_recommendations

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("electricity-backend")

app = FastAPI(title="Electricity ML Backend")

# Allow CORS for Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    logger.info("Starting Electricity ML Backend...")
    logger.info("ML Models are being pre-loaded via billing_forecaster import.")

@app.post("/recommend")
async def get_recommendations(request: Request):
    try:
        input_data = await request.json()
        projected_units = input_data.get("projectedUnits", 0)
        remaining_days = input_data.get("remainingDays", 7)
        
        logger.info(f"Generating recommendations for {projected_units} units, {remaining_days} days left")
        
        recommendations = generate_recommendations(projected_units, remaining_days)
        return {"recommendations": recommendations}
        
    except Exception as e:
        logger.exception("Error generating recommendations")
        return {"error": str(e)}

@app.post("/predict")
async def get_prediction(request: Request):
    try:
        input_data = await request.json()
        account_number = input_data.get("accountNumber", "UNKNOWN")
        monthly_history = input_data.get("history", [])
        
        logger.info(f"Received prediction request for account: {account_number}")
        
        # Run the ML pipeline
        result = predict(account_number, monthly_history)
        
        if "error" in result and not result.get("fallback"):
            logger.error(f"Prediction failed: {result['error']}")
            return {"error": result["error"]}
        
        if result.get("fallback"):
            logger.warning(f"Prediction used fallback due to error: {result.get('error')}")
            
        return result
        
    except Exception as e:
        logger.exception("Unexpected error during prediction")
        return {"error": str(e)}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import os
    # Render provides a PORT environment variable
    port = int(os.environ.get("PORT", 8000))
    # Must bind to 0.0.0.0 for external access on cloud platforms
    uvicorn.run(app, host="0.0.0.0", port=port)

