from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
import os
import uuid
from pathlib import Path

import razorpay

from ai_engine import generate_ai_recommendation
from research_engine.patterns import analyze_patterns


app = FastAPI(title="UPSHIFT API")


# =========================
# CORS
# =========================

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


# =========================
# RAZORPAY
# =========================

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")


def get_razorpay_client():
    if not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET:
        raise HTTPException(
            status_code=500,
            detail="Razorpay environment variables are missing."
        )

    return razorpay.Client(
        auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET)
    )


class PaymentVerification(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


# =========================
# DATA
# =========================

DATA_FILE = Path(__file__).parent.parent / "data" / "people.json"


def load_people():
    with open(DATA_FILE, "r", encoding="utf-8") as file:
        return json.load(file)


# =========================
# BASIC ROUTES
# =========================

@app.get("/")
def home():
    return {
        "message": "UPSHIFT API is running",
        "status": "online"
    }


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
        if person["id"] == person_id:
            return person

    return {
        "error": "Person not found"
    }


# =========================
# PATTERNS
# =========================

@app.get("/patterns")
def get_patterns():
    return analyze_patterns()


# =========================
# NORMAL RECOMMENDATION
# =========================

@app.post("/recommend")
def recommend(profile: dict):

    income = profile.get("income", 0)
    savings = profile.get("savings", 0)
    skills = profile.get("skills", "")
    goal = profile.get("goal", "")
    hours = profile.get("hours", 0)

    if income == 0:

        bottleneck = "Earning Power"

        bottleneck_reason = (
            "Your biggest opportunity is building a skill that can create income."
        )

        action_plan = [
            "Choose one high-value skill aligned with your career goal.",
            "Spend your available daily time building projects.",
            "Create one proof-of-work project for employers or clients."
        ]

    elif savings < income * 2:

        bottleneck = "Financial Discipline"

        bottleneck_reason = (
            "Your earning ability needs to be supported by stronger financial habits."
        )

        action_plan = [
            "Track every expense for the next 30 days.",
            "Create a fixed saving percentage from every income source.",
            "Build financial knowledge before taking unnecessary investment risks."
        ]

    elif len(skills.split(",")) < 3:

        bottleneck = "Skill Development"

        bottleneck_reason = (
            "You need deeper capability in a small number of valuable skills."
        )

        action_plan = [
            "Pick one primary skill instead of learning everything at once.",
            "Practice that skill for at least 60–90 minutes every day.",
            "Build increasingly difficult projects that prove your ability."
        ]

    elif hours < 2:

        bottleneck = "Time & Execution"

        bottleneck_reason = (
            "Your available focused time is currently the main constraint."
        )

        action_plan = [
            "Reserve one uninterrupted block of focused work every day.",
            "Remove the biggest distraction during that block.",
            "Measure completed work every week."
        ]

    else:

        bottleneck = "Execution"

        bottleneck_reason = (
            "You already have useful resources. Consistent execution is the next leverage point."
        )

        action_plan = [
            "Choose one important goal for the next 30 days.",
            "Break it into weekly measurable outcomes.",
            "Execute consistently and review your progress every Sunday."
        ]

    score = 50

    if income > 0:
        score += 10

    if savings > 0:
        score += 10

    if len(skills.split(",")) >= 3:
        score += 10

    if hours >= 2:
        score += 10

    if goal:
        score += 10

    return {
        "upshift_score": min(score, 100),
        "bottleneck": bottleneck,
        "bottleneck_reason": bottleneck_reason,
        "matched_patterns": [],
        "recommended_people": [],
        "action_plan": action_plan,
        "goal": goal,
        "profile": {
            "age": profile.get("age", 0),
            "income": income,
            "savings": savings,
            "skills": skills,
            "hours_per_day": hours
        }
    }


# =========================
# AI RECOMMENDATION
# =========================

@app.post("/ai-recommend")
def ai_recommend(profile: dict):
    return generate_ai_recommendation(profile)


# =========================
# CREATE RAZORPAY ORDER
# =========================

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

        print("RAZORPAY ORDER ERROR:", error)

        raise HTTPException(
            status_code=500,
            detail="Unable to create Razorpay order."
        )


# =========================
# VERIFY RAZORPAY PAYMENT
# =========================

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
    print("RAZORPAY ORDER ERROR:", repr(error))

    raise HTTPException(
        status_code=500,
        detail=str(error)
    )