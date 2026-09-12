from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json
from pathlib import Path

from ai_engine import generate_ai_recommendation
from research_engine.patterns import analyze_patterns
app = FastAPI(title="UPSHIFT API")


from fastapi.middleware.cors import CORSMiddleware

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

DATA_FILE = Path(__file__).parent.parent / "data" / "people.json"


def load_people():
    with open(DATA_FILE, "r", encoding="utf-8") as file:
        return json.load(file)


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

@app.get("/patterns")
def get_patterns():
    return analyze_patterns()
    pattern_counts = {}

    for person in people:
        for tag in person.get("pattern_tags", []):
            pattern_counts[tag] = pattern_counts.get(tag, 0) + 1

    patterns = []

    for tag, count in sorted(
        pattern_counts.items(),
        key=lambda item: item[1],
        reverse=True
    ):
        patterns.append({
            "pattern": tag.replace("_", " ").title(),
            "people_count": count,
            "evidence_strength": (
                "High"
                if count >= 3
                else "Moderate"
                if count == 2
                else "Early"
            )
        })

    return {
        "total_people_analyzed": len(people),
        "patterns": patterns
    }


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


@app.post("/ai-recommend")
def ai_recommend(profile: dict):
    return generate_ai_recommendation(profile)