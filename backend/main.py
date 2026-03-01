from fastapi import FastAPI
import pandas as pd
import joblib  
from .model import StudentPerformanceModel
app = FastAPI()
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],            
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