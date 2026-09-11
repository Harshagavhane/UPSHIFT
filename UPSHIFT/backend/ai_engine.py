import json
from pathlib import Path

from ollama import chat

from research_engine.retrieval import retrieve_research


DATA_FILE = Path(__file__).parent.parent / "data" / "people.json"


def load_people():
    with open(DATA_FILE, "r", encoding="utf-8") as file:
        return json.load(file)


def calculate_score(profile):
    income = float(profile.get("income") or 0)
    savings = float(profile.get("savings") or 0)
    hours = float(profile.get("hours") or 0)

    skills = [
        skill.strip()
        for skill in str(profile.get("skills") or "").split(",")
        if skill.strip()
    ]

    goal = str(profile.get("goal") or "").strip()

    score = 30

    if income > 0:
        score += 15

    if savings > 0:
        score += 10

    if len(skills) >= 2:
        score += 10

    if len(skills) >= 3:
        score += 10

    if hours >= 2:
        score += 10

    if hours >= 4:
        score += 5

    if goal:
        score += 10

    return min(score, 100)


def build_research_context(profile):
    goal = str(profile.get("goal") or "")
    skills = str(profile.get("skills") or "")

    query = f"{goal} {skills}"

    return retrieve_research(query, limit=8)


def find_relevant_people(research_records):

    people = load_people()

    names = {
        record.get("person")
        for record in research_records
        if record.get("person")
    }

    return [
        person
        for person in people
        if person.get("person") in names
    ]


def generate_ai_recommendation(profile):

    score = calculate_score(profile)

    research_records = build_research_context(profile)

    # ------------------------------------------------
    # NO EVIDENCE = NO AI INVENTION
    # ------------------------------------------------

    if not research_records:

        return {
            "upshift_score": score,
            "bottleneck": "Insufficient research evidence",
            "bottleneck_reason": (
                "The current UPSHIFT research database does not "
                "contain enough evidence directly related to this goal."
            ),
            "patterns": [],
            "next_moves": [],
            "people_to_study": [],
            "thirty_day_focus": (
                "Build a stronger research base for this goal."
            ),
            "warning": (
                "UPSHIFT will not invent research-supported patterns "
                "when relevant evidence is unavailable."
            )
        }

    # ------------------------------------------------
    # RELEVANT PEOPLE
    # ------------------------------------------------

    relevant_people = find_relevant_people(research_records)

    valid_evidence_ids = [
        record.get("id")
        for record in research_records
        if record.get("id") is not None
    ]

    # ------------------------------------------------
    # AI PROMPT
    # ------------------------------------------------

    prompt = f"""
You are UPSHIFT.

You are an evidence-grounded personal intelligence system.

NEVER INVENT RESEARCH.

USER PROFILE

Age: {profile.get("age")}
Monthly income: ₹{profile.get("income")}
Savings: ₹{profile.get("savings")}
Skills: {profile.get("skills")}
Goal: {profile.get("goal")}
Focused hours per day: {profile.get("hours")}

UPSHIFT SCORE

{score}

VALID EVIDENCE IDS

{json.dumps(valid_evidence_ids)}

RESEARCH RECORDS

{json.dumps(research_records, indent=2, ensure_ascii=False)}

RELEVANT PEOPLE

{json.dumps(relevant_people, indent=2, ensure_ascii=False)}

RULES

1. Identify the biggest bottleneck using ONLY the user profile.

2. Do not claim that research proves the bottleneck.

3. Select up to 3 research records that are genuinely relevant.

4. NEVER force unrelated evidence into the recommendation.

5. evidence_id MUST exactly match a research record ID.

6. evidence_claim MUST come from the research record.

7. Do not invent evidence.

8. Do not invent people.

9. Only select people from RELEVANT PEOPLE.

10. Next moves must reasonably follow from the selected evidence.

11. If evidence is weak, return fewer patterns.

12. Do not confuse financial problems with technical learning
    unless the research actually supports that connection.

13. Do not claim correlation is causation.

Return ONLY valid JSON.

Use this structure:

{{
    "upshift_score": {score},

    "bottleneck": "short bottleneck name",

    "bottleneck_reason": "profile-based explanation",

    "patterns": [
        {{
            "pattern": "research topic",
            "evidence_id": 1,
            "evidence_claim": "research claim",
            "inference": "clearly labeled interpretation"
        }}
    ],

    "next_moves": [
        {{
            "move": "specific action",
            "description": "why this action follows"
        }}
    ],

    "people_to_study": [
        {{
            "name": "exact person name",
            "reason": "why relevant"
        }}
    ],

    "thirty_day_focus": "specific objective",

    "warning": "realistic warning"
}}
"""

    try:

        response = chat(
            model="llama3.2",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            options={
                "temperature": 0.1
            }
        )

        content = response["message"]["content"].strip()

        # Remove markdown code fences if Ollama adds them.
        if content.startswith("```"):
            content = content.replace("```json", "")
            content = content.replace("```", "")
            content = content.strip()

        result = json.loads(content)

    except json.JSONDecodeError:

        return {
            "error": "AI returned invalid JSON",
            "raw_response": content
        }

    except Exception as error:

        return {
            "error": "AI engine failed",
            "message": str(error)
        }

    # ------------------------------------------------
    # VALIDATE PATTERNS
    # ------------------------------------------------

    validated_patterns = []

    patterns = result.get("patterns", [])

    if not isinstance(patterns, list):
        patterns = []

    used_evidence_ids = set()

    for pattern in patterns:

        if not isinstance(pattern, dict):
            continue

        evidence_id = pattern.get("evidence_id")

        if evidence_id not in valid_evidence_ids:
            continue

        # Do not allow the same evidence to be reused.
        if evidence_id in used_evidence_ids:
            continue

        evidence_record = next(
            (
                record
                for record in research_records
                if record.get("id") == evidence_id
            ),
            None
        )

        if evidence_record is None:
            continue

        used_evidence_ids.add(evidence_id)

        validated_patterns.append(
            {
                "pattern": evidence_record.get(
                    "topic",
                    ""
                ),

                "evidence_id": evidence_id,

                "evidence_claim": evidence_record.get(
                    "claim",
                    ""
                ),

                "inference": pattern.get(
                    "inference",
                    ""
                ),

                "research_evidence": evidence_record
            }
        )

    result["patterns"] = validated_patterns[:3]

    # ------------------------------------------------
    # VALIDATE PEOPLE
    # ------------------------------------------------

    allowed_names = {
        person.get("person")
        for person in relevant_people
        if person.get("person")
    }

    validated_people = []

    people_to_study = result.get(
        "people_to_study",
        []
    )

    if not isinstance(people_to_study, list):
        people_to_study = []

    for person in people_to_study:

        if not isinstance(person, dict):
            continue

        name = person.get("name")

        if name in allowed_names:

            validated_people.append(
                {
                    "name": name,
                    "reason": person.get(
                        "reason",
                        "Relevant to the available research."
                    )
                }
            )

    result["people_to_study"] = validated_people[:3]

    # ------------------------------------------------
    # VALIDATE NEXT MOVES
    # ------------------------------------------------

    validated_moves = []

    moves = result.get(
        "next_moves",
        []
    )

    if not isinstance(moves, list):
        moves = []

    for move in moves:

        if not isinstance(move, dict):
            continue

        move_name = move.get("move")

        if not move_name:
            continue

        validated_moves.append(
            {
                "move": move_name,
                "description": move.get(
                    "description",
                    ""
                )
            }
        )

    result["next_moves"] = validated_moves[:3]

    return result