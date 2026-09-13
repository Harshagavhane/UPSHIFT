from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import json
import os
import uuid
import razorpay

from pathlib import Path

from ai_engine import generate_ai_recommendation
from research_engine.patterns import analyze_patterns


# --------------------------------------------------
# APP
# --------------------------------------------------

app = FastAPI(title="UPSHIFT API")


# --------------------------------------------------
# CORS
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://upshift-seven.vercel.app",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# PATHS
# --------------------------------------------------

DATA_FILE = Path(__file__).parent.parent / "data" / "people.json"


# --------------------------------------------------
# ENVIRONMENT VARIABLES
# --------------------------------------------------

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")


# --------------------------------------------------
# HELPERS
# --------------------------------------------------

def load_people():
    """
    Load people data from data/people.json
    """

    if not DATA_FILE.exists():
        raise HTTPException(
            status_code=500,
            detail="People data file not found."
        )

    try:
        with open(DATA_FILE, "r", encoding="utf-8") as file:
            return json.load(file)

    except Exception as error:
        print("DATA LOAD ERROR:", repr(error))

        raise HTTPException(
            status_code=500,
            detail="Unable to load people data."
        )


def get_razorpay_client():
    """
    Create Razorpay client using Render environment variables.
    """

    if not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET:
        raise HTTPException(
            status_code=500,
            detail="Razorpay environment variables are missing."
        )

    return razorpay.Client(
        auth=(
            RAZORPAY_KEY_ID,
            RAZORPAY_KEY_SECRET
        )
    )


# --------------------------------------------------
# PAYMENT MODEL
# --------------------------------------------------

class PaymentVerification(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


# --------------------------------------------------
# BASIC ROUTE
# --------------------------------------------------

@app.get("/")
def home():
    return {
        "message": "UPSHIFT API is running",
        "status": "online"
    }


# --------------------------------------------------
# PEOPLE ROUTES
# --------------------------------------------------

@app.get("/people")
def get_people():
    people = load_people()

    return {
        "count": len(people),
        "people": people
    }


@app.get("/people/{person_id}")
def get_person(person_id: int):
    people = load_people()

    for person in people:
        if person.get("id") == person_id:
            return person

    raise HTTPException(
        status_code=404,
        detail="Person not found."
    )


# --------------------------------------------------
# PATTERNS ROUTE
# --------------------------------------------------

@app.get("/patterns")
def get_patterns():
    return analyze_patterns()


# --------------------------------------------------
# BASIC RECOMMENDATION ROUTE
# --------------------------------------------------

@app.post("/recommend")
def recommend(profile: dict):
    """
    Basic fallback recommendation.
    """

    goal = profile.get("goal", "").strip()
    age = profile.get("age", "")
    skills = profile.get("skills", "")
    time_available = profile.get("time", "")

    if not goal:
        return {
            "error": "Please provide your goal."
        }

    return {
        "title": "Your next move",
        "message": (
            f"Your main goal is: {goal}. "
            "Start with one focused action today "
            "and track your progress for the next 7 days."
        ),
        "profile": {
            "age": age,
            "skills": skills,
            "time_available": time_available
        },
        "action_plan": [
            "Define one clear target.",
            "Spend 60 minutes daily on that target.",
            "Build one practical output this week.",
            "Review your progress every Sunday."
        ]
    }


# --------------------------------------------------
# AI RECOMMENDATION ROUTE
# --------------------------------------------------

@app.post("/ai-recommend")
def ai_recommend(profile: dict):
    try:
        return generate_ai_recommendation(profile)

    except Exception as error:
        print("AI RECOMMENDATION ERROR:", repr(error))

        raise HTTPException(
            status_code=500,
            detail="Unable to generate AI recommendation."
        )


# --------------------------------------------------
# CREATE RAZORPAY ORDER
# --------------------------------------------------

@app.post("/create-payment-order")
def create_payment_order():

    try:
        client = get_razorpay_client()

        order = client.order.create({
            "amount": 4900,
            "currency": "INR",
            "receipt": f"upshift_{uuid.uuid4().hex[:20]}",
        })

        return {
            "key_id": RAZORPAY_KEY_ID,
            "order_id": order["id"],
            "amount": order["amount"],
            "currency": order["currency"],
        }

    except HTTPException:
        raise

    except Exception as error:
        print("RAZORPAY ORDER ERROR:", repr(error))

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


# --------------------------------------------------
# VERIFY RAZORPAY PAYMENT
# --------------------------------------------------

@app.post("/verify-payment")
def verify_payment(payment: PaymentVerification):

    try:
        client = get_razorpay_client()

        client.utility.verify_payment_signature({
            "razorpay_order_id": payment.razorpay_order_id,
            "razorpay_payment_id": payment.razorpay_payment_id,
            "razorpay_signature": payment.razorpay_signature,
        })

        return {
            "success": True,
            "premium": True,
            "message": "Payment verified successfully."
        }

    except HTTPException:
        raise

    except Exception as error:
        print("RAZORPAY VERIFICATION ERROR:", repr(error))

        raise HTTPException(
            status_code=400,
            detail="Payment verification failed."
        )