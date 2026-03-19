import time
import random
import httpx
from fastapi import FastAPI, File, UploadFile, Form, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification

app = FastAPI(title="ForestGuard AI Backend", version="1.0.0")

# Enable CORS so the React frontend can talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SensorData(BaseModel):
    sensor_id: str
    region: str
    log_text: str

# -----------------------------------------------------------------------------
# LLM Inference Engine (Integrating Trained Model)
# -----------------------------------------------------------------------------
MODEL_PATH = "./models/hunting_llm_final"
try:
    print(f"Loading Hunting LLM from {MODEL_PATH}...")
    tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
    model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)
    print("Hunting LLM Loaded Successfully!")
except Exception as e:
    print(f"Warning: Could not load real model. Error: {e}")
    tokenizer = None
    model = None

LABELS = {0: "Safe (Animals/Wind)", 1: "Suspicious (Human Presence)", 2: "Hunting/Poaching Detected"}
def analyze_sensor_log_with_llm(text: str):
    text_lower = text.lower()
    
    # Simulate LLM understanding the context
    if any(word in text_lower for word in ["gun", "shot", "rifle", "poach", "kill"]):
        return {"threat_level": "critical", "confidence": random.randint(92, 99), "event_type": "Gunshot Detected"}
    elif any(word in text_lower for word in ["vehicle", "engine", "motor", "tire"]):
        return {"threat_level": "high", "confidence": random.randint(85, 95), "event_type": "Unauthorized Vehicle"}
    elif any(word in text_lower for word in ["human", "voice", "footstep", "speak"]):
        return {"threat_level": "medium", "confidence": random.randint(70, 89), "event_type": "Human Presence"}
    else:
        return {"threat_level": "low", "confidence": random.randint(95, 99), "event_type": "Normal Background Noise"}

@app.get("/")
def read_root():
    return {"status": "ok", "message": "ForestGuard AI Backend is running."}

@app.get("/api/fire-alerts")
async def get_fire_alerts():
    """
    Fetches active fire alerts. In a production app with a MAP_KEY,
    this would call: https://firms.modaps.eosdis.nasa.gov/api/area/csv/[MAP_KEY]/VIIRS_SNPP_NRT/-180,-90,180,90/1
    
    We simulate the response for fire alerts.
    """
    alerts = []

    # Simulate fetching from NASA FIRMS since we don't have a MAP_KEY
    # We will generate recent fires globally
    for i in range(15):
        alerts.append({
            "id": f"FIRMS-{random.randint(1000, 9999)}",
            "lat": random.uniform(-50, 50),
            "lng": random.uniform(-120, 140),
            "brightness": random.uniform(300, 450),
            "confidence": random.randint(50, 100),
            "acq_date": time.strftime("%Y-%m-%d"),
            "acq_time": f"{random.randint(0,23):02d}{random.randint(0,59):02d}",
            "satellite": random.choice(["Aqua", "Terra", "NPP", "NOAA20"]),
            "instrument": random.choice(["MODIS", "VIIRS"])
        })
        
    return {
        "status": "success",
        "source": "NASA FIRMS",
        "data": alerts
    }

@app.post("/api/analyze-hunting/text")
async def analyze_hunting_text(data: SensorData):
    """
    Endpoint for the React frontend to submit acoustic or text-based sensor logs
    to the Hunting Detection LLM.
    """
    if model is not None and tokenizer is not None:
        try:
            inputs = tokenizer(data.log_text, return_tensors="pt", padding=True, truncation=True, max_length=64)
            with torch.no_grad():
                outputs = model(**inputs)
                
            predicted_class = torch.argmax(outputs.logits, dim=1).item()
            confidence = torch.nn.functional.softmax(outputs.logits, dim=1)[0][predicted_class].item()
            
            threat_mapping = {0: "low", 1: "medium", 2: "critical"}
            
            analysis = {
                "threat_level": threat_mapping.get(predicted_class, "low"),
                "confidence": int(confidence * 100),
                "event_type": LABELS.get(predicted_class, "Unknown")
            }
            return {
                "status": "success",
                "sensor_id": data.sensor_id,
                "region": data.region,
                "input_log": data.log_text,
                "analysis": analysis,
                "timestamp": time.time(),
                "mode": "real_llm"
            }
        except Exception as e:
            print("Real model inference failed. Fallback to simulation.", e)

    # Fallback simulation
    time.sleep(1.5)
    analysis = analyze_sensor_log_with_llm(data.log_text)
    
    return {
        "status": "success",
        "sensor_id": data.sensor_id,
        "region": data.region,
        "input_log": data.log_text,
        "analysis": analysis,
        "timestamp": time.time(),
        "mode": "simulated"
    }

@app.post("/api/analyze-hunting/image")
async def analyze_hunting_image(file: UploadFile = File(...), region: str = Form(...)):
    """
    Endpoint for uploading drone or camera trap images to a Vision LLM.
    Simulates image analysis for hunting gear or poachers.
    """
    # Simulate processing delay for heavy image models
    time.sleep(2.5)
    
    # Randomly simulate finding a threat in the image (since we don't have a real model loaded)
    is_threat = random.random() > 0.4
    
    if is_threat:
        threat_levels = ["high", "critical"]
        event_types = ["Armed Individual Detected", "Suspicious Camp Detected", "Poaching Vehicle"]
        return {
            "status": "success",
            "region": region,
            "filename": file.filename,
            "analysis": {
                "threat_level": random.choice(threat_levels),
                "confidence": random.randint(88, 98),
                "event_type": random.choice(event_types)
            }
        }
    else:
        return {
            "status": "success",
            "region": region,
            "filename": file.filename,
            "analysis": {
                "threat_level": "low",
                "confidence": 99,
                "event_type": "Clear / Wildlife Only"
            }
        }

if __name__ == "__main__":
    print("Starting ForestGuard AI Backend on http://localhost:8000")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
