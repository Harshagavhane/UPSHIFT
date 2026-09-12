import os
import json
from openai import OpenAI


client = OpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1"
)


def generate_ai_recommendation(profile):

    people_to_study = [
        {
            "name": "Warren Buffett",
            "reason": "Long-term thinking, patience and disciplined decision making."
        },
        {
            "name": "Jeff Bezos",
            "reason": "Customer obsession, experimentation and long-term execution."
        },
        {
            "name": "Bill Gates",
            "reason": "Continuous learning, strategic thinking and technology."
        }
    ]

    fallback = {
        "upshift_score": 70,
        "bottleneck": "Focused execution",
        "bottleneck_reason": "Your next level needs one clear priority instead of scattered effort.",
        "next_moves": [
            "Choose one high-value skill.",
            "Build one proof-of-work project.",
            "Review your progress every Sunday."
        ],
        "people_to_study": people_to_study,
        "thirty_day_focus": "Build one valuable skill and turn it into visible proof."
    }

    try:

        prompt = f"""
You are UPSHIFT, a practical personal intelligence assistant.

USER PROFILE:
{json.dumps(profile, indent=2)}

Analyze the user's situation and return ONLY valid JSON.

Use exactly this structure:

{{
    "upshift_score": 70,
    "bottleneck": "Focused execution",
    "bottleneck_reason": "Short explanation",
    "next_moves": [
        "Action 1",
        "Action 2",
        "Action 3"
    ],
    "thirty_day_focus": "One clear 30-day focus"
}}

Rules:
- Score must be between 0 and 100.
- Give practical advice.
- Keep every answer concise.
- Never guarantee money, career or investment results.
- Do not invent facts or research.
- Return valid JSON only.
"""

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": "You are UPSHIFT. Always return valid JSON."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.2
        )

        text = response.choices[0].message.content.strip()

        if text.startswith("```"):
            text = text.replace("```json", "")
            text = text.replace("```", "")
            text = text.strip()

        ai_result = json.loads(text)

        ai_result["people_to_study"] = people_to_study

        return ai_result

    except Exception as error:

        print("UPSHIFT AI ERROR:", error)

        return fallback