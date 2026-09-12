import os
import json
from pathlib import Path

from openai import OpenAI


# =========================================================
# UPSHIFT INTELLIGENCE ENGINE
# =========================================================

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR.parent / "data"

PEOPLE_FILE = DATA_DIR / "people.json"
RESEARCH_FILE = DATA_DIR / "research_records.json"


client = OpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1",
)


def load_json(file_path, default):
    try:
        with open(file_path, "r", encoding="utf-8") as file:
            return json.load(file)
    except Exception as error:
        print(f"UPSHIFT DATA ERROR: {error}")
        return default


def load_people():
    return load_json(PEOPLE_FILE, [])


def load_research_records():
    return load_json(RESEARCH_FILE, [])


def normalize(value):
    return str(value or "").lower().strip()


def find_relevant_research(profile):
    """
    Finds research records that are relevant to the user's
    current goal, skills, situation and problem.
    """

    records = load_research_records()

    profile_text = " ".join(
        [
            normalize(profile.get("goal")),
            normalize(profile.get("skills")),
            normalize(profile.get("situation")),
            normalize(profile.get("problem")),
        ]
    )

    keyword_groups = {
        "career": [
            "job",
            "career",
            "internship",
            "placement",
            "work",
            "skill",
            "career",
        ],
        "ai": [
            "ai",
            "artificial intelligence",
            "machine learning",
            "llm",
            "generative ai",
            "python",
        ],
        "business": [
            "business",
            "startup",
            "company",
            "entrepreneur",
            "sales",
            "customer",
        ],
        "money": [
            "money",
            "wealth",
            "income",
            "invest",
            "finance",
            "saving",
        ],
        "leadership": [
            "leadership",
            "leader",
            "team",
            "management",
        ],
        "communication": [
            "communication",
            "speaking",
            "presentation",
            "confidence",
            "network",
        ],
        "discipline": [
            "discipline",
            "consistency",
            "habit",
            "focus",
            "productivity",
        ],
        "failure": [
            "failure",
            "fail",
            "mistake",
            "setback",
            "risk",
        ],
        "innovation": [
            "innovation",
            "creative",
            "technology",
            "product",
        ],
    }

    matched_categories = []

    for category, keywords in keyword_groups.items():
        if any(keyword in profile_text for keyword in keywords):
            matched_categories.append(category)

    scored_records = []

    for record in records:

        record_text = " ".join(
            [
                normalize(record.get("person")),
                normalize(record.get("category")),
                normalize(record.get("principle")),
                normalize(record.get("experience")),
                normalize(record.get("context")),
                normalize(record.get("tags")),
            ]
        )

        score = 0

        for category in matched_categories:
            if category in record_text:
                score += 3

        for word in profile_text.split():
            if len(word) > 3 and word in record_text:
                score += 1

        if score > 0:
            scored_records.append(
                {
                    "score": score,
                    "record": record,
                }
            )

    scored_records.sort(
        key=lambda item: item["score"],
        reverse=True,
    )

    return [
        item["record"]
        for item in scored_records[:10]
    ]


def build_pattern_evidence(relevant_records):
    """
    Converts research records into compact evidence
    that can be given to the AI.
    """

    pattern_counts = {}

    for record in relevant_records:

        for tag in record.get("tags", []):
            tag = normalize(tag)

            if not tag:
                continue

            if tag not in pattern_counts:
                pattern_counts[tag] = {
                    "count": 0,
                    "people": [],
                    "examples": [],
                }

            pattern_counts[tag]["count"] += 1

            person = record.get("person")

            if person and person not in pattern_counts[tag]["people"]:
                pattern_counts[tag]["people"].append(person)

            example = (
                record.get("principle")
                or record.get("experience")
                or record.get("context")
            )

            if example and len(pattern_counts[tag]["examples"]) < 3:
                pattern_counts[tag]["examples"].append(example)

    evidence = []

    for tag, data in sorted(
        pattern_counts.items(),
        key=lambda item: item[1]["count"],
        reverse=True,
    ):

        count = data["count"]

        if count >= 5:
            strength = "Very Strong"
        elif count >= 3:
            strength = "Strong"
        elif count == 2:
            strength = "Moderate"
        else:
            strength = "Early"

        evidence.append(
            {
                "pattern": tag.replace("_", " ").title(),
                "records_count": count,
                "evidence_strength": strength,
                "people": data["people"],
                "examples": data["examples"],
            }
        )

    return evidence[:8]


def fallback_result(profile, evidence, relevant_records):
    """
    Safe fallback if the AI service is unavailable.
    """

    goal = profile.get("goal") or "your current goal"

    top_patterns = evidence[:3]

    people = []

    for record in relevant_records:

        person = record.get("person")

        if person and person not in people:
            people.append(person)

    if not people:
        people = [
            "Warren Buffett",
            "Jeff Bezos",
            "Bill Gates",
        ]

    pattern_names = [
        item["pattern"]
        for item in top_patterns
    ]

    if pattern_names:
        bottleneck = pattern_names[0]
    else:
        bottleneck = "Focused execution"

    return {
        "upshift_score": 70,
        "bottleneck": bottleneck,
        "bottleneck_reason": (
            f"Your current goal is {goal}. "
            "The strongest opportunity is to turn "
            "learning into focused execution."
        ),
        "patterns_detected": top_patterns,
        "evidence_summary": (
            "UPSHIFT found repeated patterns in its "
            "current research dataset. Evidence strength "
            "depends on how many research records support "
            "each pattern."
        ),
        "next_moves": [
            "Choose one high-value priority.",
            "Turn that priority into visible proof-of-work.",
            "Review your progress every week and adjust.",
        ],
        "people_to_study": [
            {
                "name": person,
                "reason": (
                    "Relevant research pattern identified "
                    "for your current direction."
                ),
            }
            for person in people[:5]
        ],
        "thirty_day_focus": (
            "Build one valuable capability and create "
            "visible evidence of progress."
        ),
    }


def generate_ai_recommendation(profile):

    people = load_people()
    relevant_records = find_relevant_research(profile)
    evidence = build_pattern_evidence(relevant_records)

    research_context = {
        "relevant_research_records": relevant_records,
        "patterns": evidence,
        "people_available": [
            person.get("name")
            for person in people
            if person.get("name")
        ],
    }

    fallback = fallback_result(
        profile,
        evidence,
        relevant_records,
    )

    try:

        prompt = f"""
You are UPSHIFT.

UPSHIFT is a personal intelligence system.
It studies experiences, decisions, principles,
failures and repeated patterns from notable people.

Your job is NOT to give generic motivational advice.

You must reason from the supplied research evidence
and then personalize the recommendation to the user.

USER PROFILE:
{json.dumps(profile, indent=2, ensure_ascii=False)}

RESEARCH EVIDENCE:
{json.dumps(research_context, indent=2, ensure_ascii=False)}

Return ONLY valid JSON.

Use exactly this structure:

{{
    "upshift_score": 70,
    "bottleneck": "Short bottleneck name",
    "bottleneck_reason": "Short explanation specific to the user",
    "patterns_detected": [
        {{
            "pattern": "Pattern name",
            "records_count": 2,
            "evidence_strength": "Moderate",
            "people": ["Person 1", "Person 2"],
            "why_relevant": "Why this pattern matters for this user"
        }}
    ],
    "evidence_summary": "Short explanation of what the research suggests",
    "next_moves": [
        "Specific action 1",
        "Specific action 2",
        "Specific action 3"
    ],
    "people_to_study": [
        {{
            "name": "Person name",
            "reason": "Why this person is relevant"
        }}
    ],
    "thirty_day_focus": "One clear 30-day focus"
}}

Rules:

1. Score must be between 0 and 100.
2. Give practical advice.
3. Personalize the answer to the profile.
4. Use the supplied research evidence.
5. Never invent research.
6. Never claim that a pattern is proven causal.
7. Evidence strength must reflect the supplied record count.
8. Never guarantee money, career or investment results.
9. Do not provide personalized financial investment instructions.
10. Keep the answer concise.
11. Return valid JSON only.
"""

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are the UPSHIFT Intelligence Engine. "
                        "Return valid JSON only."
                    ),
                },
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
            temperature=0.2,
        )

        text = response.choices[0].message.content.strip()

        if text.startswith("```"):
            text = text.replace("```json", "")
            text = text.replace("```", "")
            text = text.strip()

        result = json.loads(text)

        # Guarantee fields expected by the frontend.
        result.setdefault(
            "patterns_detected",
            evidence,
        )

        result.setdefault(
            "evidence_summary",
            "Research-backed pattern analysis.",
        )

        result.setdefault(
            "people_to_study",
            [],
        )

        result.setdefault(
            "next_moves",
            fallback["next_moves"],
        )

        result.setdefault(
            "thirty_day_focus",
            fallback["thirty_day_focus"],
        )

        return result

    except Exception as error:

        print("UPSHIFT INTELLIGENCE ERROR:", error)

        return fallback