import json
from pathlib import Path
from collections import Counter

DATA_DIR = Path(__file__).parent.parent.parent / "data"

PEOPLE_FILE = DATA_DIR / "people.json"
RESEARCH_FILE = DATA_DIR / "research_records.json"


def load_people():
    with open(PEOPLE_FILE, "r", encoding="utf-8") as file:
        return json.load(file)


def load_research_records():
    with open(RESEARCH_FILE, "r", encoding="utf-8") as file:
        return json.load(file)


def analyze_patterns():
    people = load_people()
    records = load_research_records()

    pattern_counter = Counter()

    for record in records:
        for tag in record.get("tags", []):
            pattern_counter[tag] += 1

    patterns = []

    for tag, count in pattern_counter.most_common():

        if count >= 5:
            evidence = "Very Strong"
        elif count >= 3:
            evidence = "Strong"
        elif count == 2:
            evidence = "Moderate"
        else:
            evidence = "Early"

        related_people = []

        for record in records:
            if tag in record.get("tags", []):
                person = record.get("person")

                if person and person not in related_people:
                    related_people.append(person)

        patterns.append({
            "pattern": tag.replace("_", " ").title(),
            "records_count": count,
            "evidence_strength": evidence,
            "people": related_people
        })

    return {
        "total_people": len(people),
        "total_research_records": len(records),
        "total_patterns": len(patterns),
        "patterns": patterns
    }