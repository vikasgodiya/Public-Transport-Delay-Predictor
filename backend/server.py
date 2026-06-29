from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Literal
from pathlib import Path
import logging

import joblib
import pandas as pd

ROOT_DIR = Path(__file__).parent
MODEL_DIR = ROOT_DIR / "ml_models"

# Load model + feature columns at startup
MODEL = joblib.load(MODEL_DIR / "random_forest_model.pkl")
FEATURE_COLUMNS: List[str] = joblib.load(MODEL_DIR / "feature_columns.pkl")

app = FastAPI(title="Transit Delay Predictor")
api_router = APIRouter(prefix="/api")

# -----------------------------
# Static dropdown options
# -----------------------------
TRANSPORT_TYPES = ["Bus", "Metro", "Train", "Tram"]
ROUTES = [f"Route_{i}" for i in range(1, 21)]
WEATHER_CONDITIONS = ["Clear", "Cloudy", "Fog", "Rain", "Snow", "Storm"]
EVENT_TYPES = ["No Event", "Festival", "Parade", "Protest", "Sports"]
SEASONS = ["Fall", "Spring", "Summer", "Winter"]
DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]


# -----------------------------
# Models
# -----------------------------
class PredictionInput(BaseModel):
    model_config = ConfigDict(extra="ignore")
    transport_type: Literal["Bus", "Metro", "Train", "Tram"]
    route_id: str
    departure_hour: int = Field(ge=0, le=23)
    trip_duration_min: int = Field(ge=1, le=600)
    weather_condition: Literal["Clear", "Cloudy", "Fog", "Rain", "Snow", "Storm"]
    temperature_C: float = Field(ge=-30, le=55)
    precipitation_mm: float = Field(ge=0, le=200)
    traffic_congestion_index: float = Field(ge=0, le=1)
    event_type: Literal["No Event", "Festival", "Parade", "Protest", "Sports"]
    season: Literal["Fall", "Spring", "Summer", "Winter"]
    holiday: bool = False
    day_of_week: Literal["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]


# -----------------------------
# Feature engineering — 12 user inputs -> 59 model features
# -----------------------------
DOW_MAP = {"Monday": 0, "Tuesday": 1, "Wednesday": 2, "Thursday": 3, "Friday": 4, "Saturday": 5, "Sunday": 6}
WEATHER_HUMIDITY = {"Clear": 45, "Cloudy": 65, "Fog": 90, "Rain": 85, "Snow": 80, "Storm": 88}
WEATHER_WIND = {"Clear": 8, "Cloudy": 12, "Fog": 6, "Rain": 18, "Snow": 22, "Storm": 45}
EVENT_ATTENDANCE = {"No Event": 0, "Festival": 8000, "Parade": 5000, "Protest": 3000, "Sports": 15000}


def build_feature_vector(inp: PredictionInput) -> pd.DataFrame:
    dow = DOW_MAP[inp.day_of_week]
    is_weekend = 1 if dow >= 5 else 0
    weekday = 1 - is_weekend
    peak_hour = 1 if (7 <= inp.departure_hour <= 9 or 17 <= inp.departure_hour <= 19) else 0
    arrival_hour = (inp.departure_hour + inp.trip_duration_min // 60) % 24
    event_present = 0 if inp.event_type == "No Event" else 1
    bad_weather = 1 if inp.weather_condition in ("Rain", "Snow", "Storm", "Fog") else 0
    high_traffic = 1 if inp.traffic_congestion_index > 0.7 else 0
    heavy_rain = 1 if inp.precipitation_mm > 10 else 0
    morning_peak = 1 if 7 <= inp.departure_hour <= 9 else 0
    non_peak = 1 if peak_hour == 0 else 0

    row = {col: 0 for col in FEATURE_COLUMNS}
    row.update({
        "temperature_C": inp.temperature_C,
        "humidity_percent": WEATHER_HUMIDITY[inp.weather_condition],
        "wind_speed_kmh": WEATHER_WIND[inp.weather_condition],
        "precipitation_mm": inp.precipitation_mm,
        "event_attendance_est": EVENT_ATTENDANCE[inp.event_type],
        "traffic_congestion_index": inp.traffic_congestion_index,
        "holiday": 1 if inp.holiday else 0,
        "peak_hour": peak_hour,
        "weekday": weekday,
        "day": 15,
        "day_of_week": dow,
        "is_weekend": is_weekend,
        "trip_hour": inp.departure_hour,
        "departure_hour": inp.departure_hour,
        "arrival_hour": arrival_hour,
        "trip_duration_min": inp.trip_duration_min,
        "event_present": event_present,
        "bad_weather": bad_weather,
        "high_traffic": high_traffic,
        "heavy_rain": heavy_rain,
        "origin_station_freq": 50,
        "destination_station_freq": 50,
    })

    # one-hot encodings
    for col_name in [
        f"transport_type_{inp.transport_type}",
        f"route_id_{inp.route_id}",
        f"weather_condition_{inp.weather_condition}",
        f"event_type_{inp.event_type}",
        f"season_{inp.season}",
    ]:
        if col_name in row:
            row[col_name] = 1

    row["rush_period_Morning Peak"] = morning_peak
    row["rush_period_Non Peak"] = non_peak

    return pd.DataFrame([row], columns=FEATURE_COLUMNS)


# -----------------------------
# Routes
# -----------------------------
@api_router.get("/")
async def root():
    return {"status": "ok", "service": "transit-delay-predictor", "n_features": len(FEATURE_COLUMNS)}


@api_router.get("/options")
async def get_options():
    return {
        "transport_types": TRANSPORT_TYPES,
        "routes": ROUTES,
        "weather_conditions": WEATHER_CONDITIONS,
        "event_types": EVENT_TYPES,
        "seasons": SEASONS,
        "days_of_week": DAYS_OF_WEEK,
    }


@api_router.post("/predict")
async def predict(inp: PredictionInput):
    try:
        X = build_feature_vector(inp)
        proba = MODEL.predict_proba(X.values)[0]
        on_time_p = float(proba[0])
        delay_p = float(proba[1])
        pred = int(delay_p >= 0.5)
        label = "DELAYED" if pred == 1 else "ON TIME"
        confidence = max(on_time_p, delay_p)

        return {
            "inputs": inp.model_dump(),
            "prediction": pred,
            "label": label,
            "delay_probability": delay_p,
            "on_time_probability": on_time_p,
            "confidence": confidence,
        }
    except Exception as e:
        logging.exception("prediction failed")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {e}")


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
