# Transit Delay Predictor

A web app that predicts public transport delays using a pre-trained Random Forest model.

Twelve user-friendly inputs (transport type, route, departure hour, trip duration, weather,
temperature, precipitation, traffic, event, season, day of week, holiday) are expanded into
the 59 features that the Random Forest expects. The model returns a delay probability and a
binary verdict (`DELAYED` / `ON TIME`).

## Tech Stack

- **Backend**: FastAPI · scikit-learn 1.6.1 · joblib · pandas
- **Frontend**: React 19 · Tailwind CSS · shadcn/ui · Phosphor Icons
- **Storage**: None (stateless predictor — every call is independent)

## Project Structure

```
transit-predictor/
├── backend/
│   ├── server.py                      # FastAPI app
│   ├── requirements.txt
│   └── ml_models/
│       ├── random_forest_model.pkl    # Pre-trained classifier
│       └── feature_columns.pkl        # 59-column schema
└── frontend/
    ├── package.json
    ├── craco.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── jsconfig.json
    ├── public/
    └── src/
        ├── App.js
        ├── index.js / index.css
        ├── lib/api.js
        ├── components/
        │   ├── Layout.jsx
        │   ├── PredictForm.jsx
        │   ├── PredictionResult.jsx
        │   └── ui/                    # shadcn components
        └── pages/PredictPage.jsx
```

## Prerequisites

- Python 3.11+
- Node.js 18+ and Yarn (`npm install -g yarn`)

## Run the Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate            # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

Verify: open <http://localhost:8001/api/> — you should see
`{"status":"ok","service":"transit-delay-predictor","n_features":59}`.

## Run the Frontend

```bash
cd frontend
cp .env.example .env                 # uses http://localhost:8001 by default
yarn install
yarn start
```

App opens at <http://localhost:3000>.

## API

| Method | Path | Description |
|--------|------|-------------|
| GET    | `/api/`         | Health / model info |
| GET    | `/api/options`  | Dropdown enums (routes, weather, etc.) |
| POST   | `/api/predict`  | Run prediction with 12 inputs |

### Example request

```bash
curl -X POST http://localhost:8001/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "transport_type": "Metro",
    "route_id": "Route_5",
    "departure_hour": 8,
    "trip_duration_min": 30,
    "weather_condition": "Rain",
    "temperature_C": 12,
    "precipitation_mm": 15,
    "traffic_congestion_index": 0.85,
    "event_type": "No Event",
    "season": "Spring",
    "holiday": false,
    "day_of_week": "Monday"
  }'
```

### Example response

```json
{
  "inputs": { "...": "..." },
  "prediction": 1,
  "label": "DELAYED",
  "delay_probability": 0.57,
  "on_time_probability": 0.43,
  "confidence": 0.57
}
```

## Important Note

The Random Forest pickle was trained with **scikit-learn 1.6.1**. Newer versions throw
`STACK_GLOBAL requires str` on unpickling. The version is pinned in `requirements.txt`.
