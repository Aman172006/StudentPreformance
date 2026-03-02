from fastapi import FastAPI
import pandas as pd
import joblib  
from model import StudentPerformanceModel
app = FastAPI()
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*",
        "https://studentpreformance-1-epmy.onrender.com",
        "http://192.168.1.23:3000"
    ],            
    allow_methods=["*"],        
    allow_headers=["*"],
)

import os
import joblib

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

model = joblib.load(os.path.join(BASE_DIR, "student_performance_model.pkl"))
model_columns = joblib.load(os.path.join(BASE_DIR, "model_columns.pkl"))
def process_input(payload: StudentPerformanceModel):
    
    # Placeholder for data processing logic
    data_dict = payload.model_dump()
    x_df = pd.DataFrame([data_dict])

    # One-hot encode same as training (drop_first=True)
    x_df = pd.get_dummies(x_df, drop_first=True)

    # Align columns to training columns
    x_df = x_df.reindex(columns=model_columns, fill_value=0)

    return x_df

@app.post("/predict")
def predict(payload: StudentPerformanceModel):
    x_df = process_input(payload)
    raw_pred = model.predict(x_df)[0]

    # ensure the returned grade is within expected bounds (0‑20)
    prediction = max(0, min(raw_pred, 20))

    return {"predicted_grade": prediction}

from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
FRONTEND_DIST = BASE_DIR / "frontend_dist"  # we will copy dist here during build

# Serve frontend files
if FRONTEND_DIST.exists():
    app.mount("/", StaticFiles(directory=FRONTEND_DIST, html=True), name="frontend")

    @app.get("/{full_path:path}")
    def spa_fallback(full_path: str):
        index_file = FRONTEND_DIST / "index.html"
        return FileResponse(index_file)