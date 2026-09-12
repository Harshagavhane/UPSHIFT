import os
from openai import OpenAI

client = OpenAI(
    base_url="https://api.groq.com/openai/v1",
    api_key=os.getenv("GROQ_API_KEY")
)

def generate_ai_recommendation(profile):
    prompt = f"""
You are UPSHIFT, an evidence-based personal intelligence assistant.

User profile:
{profile}

Give practical advice based only on the information provided.
Do not invent research, statistics, people, or evidence.

Return a concise recommendation with:
- bottleneck
- bottleneck_reason
- next_moves
- thirty_day_focus
"""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "user", "content": prompt}
        ],
        temperature=0.2,
    )

    return {
        "upshift_score": 70,
        "bottleneck": "Execution",
        "bottleneck_reason": response.choices[0].message.content,
        "patterns": [],
        "next_moves": [],
        "people_to_study": [],
        "thirty_day_focus": "Execute one high-impact action consistently for 30 days."
    }