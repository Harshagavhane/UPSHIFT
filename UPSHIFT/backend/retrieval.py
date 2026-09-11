import json
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent.parent / "data"
RESEARCH_FILE = DATA_DIR / "research_records.json"


def load_research():
    with open(RESEARCH_FILE, "r", encoding="utf-8") as file:
        return json.load(file)


def retrieve_research(query, limit=5):
    records = load_research()

    query_words = [
        word.lower().strip(".,!?")
        for word in str(query).split()
        if len(word.strip(".,!?")) >= 3
    ]

    scored = []

    for record in records:

        searchable_text = " ".join([
            str(record.get("person", "")),
            str(record.get("topic", "")),
            str(record.get("claim", "")),
            str(record.get("context", "")),
            " ".join(record.get("tags", []))
        ]).lower()

        score = 0

        for word in query_words:
            if word in searchable_text:
                score += 1

        scored.append((score, record))

    scored.sort(
        key=lambda item: item[0],
        reverse=True
    )

    return [
        record
        for score, record in scored[:limit]
        if score > 0
    ]