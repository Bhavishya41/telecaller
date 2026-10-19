from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd

app = FastAPI(
    title="TeleConnect Analytics Microservice",
    description="Analytics engine for conversion ratios, disposition rates, and lead metrics",
    version="1.0.0"
)

# Allow CORS for local React/Vite development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class BusinessLead(BaseModel):
    id: Optional[str] = None
    category: Optional[str] = "Other"
    type: Optional[List[str]] = []
    registered: bool = False
    assignedTo: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "fastapi-analytics"}

@app.post("/api/analytics/metrics")
def calculate_metrics(leads: List[BusinessLead]):
    if not leads:
        return {
            "totalLeads": 0,
            "registeredCount": 0,
            "pendingCount": 0,
            "conversionRate": 0.0,
            "categoryBreakdown": {},
            "topCities": {}
        }

    # Convert incoming payload to a Pandas DataFrame
    data = [lead.model_dump() for lead in leads]
    df = pd.DataFrame(data)

    total = len(df)
    registered = int(df["registered"].sum())
    pending = total - registered
    conversion_rate = round((registered / total) * 100, 2) if total > 0 else 0.0

    category_counts = df["category"].fillna("Other").value_counts().to_dict()
    city_counts = df["city"].dropna().value_counts().head(5).to_dict()

    return {
        "totalLeads": total,
        "registeredCount": registered,
        "pendingCount": pending,
        "conversionRate": conversion_rate,
        "categoryBreakdown": category_counts,
        "topCities": city_counts
    }