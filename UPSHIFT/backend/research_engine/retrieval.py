import json
from pathlib import Path
import re


DATA_DIR = Path(__file__).parent.parent.parent / "data"
RESEARCH_FILE = DATA_DIR / "research_records.json"


def load_research():
    with open(RESEARCH_FILE, "r", encoding="utf-8") as file:
        return json.load(file)


def tokenize(text):
    return set(
        re.findall(
            r"[a-zA-Z0-9_]+",
            str(text).lower()
        )
    )


def retrieve_research(query, limit=5):

    records = load_research()

    query_words = tokenize(query)

    scored = []

    for record in records:

        topic_words = tokenize(record.get("topic", ""))
        tags_words = tokenize(
            " ".join(record.get("tags", []))
        )
        claim_words = tokenize(record.get("claim", ""))
        context_words = tokenize(record.get("context", ""))

        topic_matches = len(query_words & topic_words)
        tag_matches = len(query_words & tags_words)
        claim_matches = len(query_words & claim_words)
        context_matches = len(query_words & context_words)

        score = (
            topic_matches * 6
            + tag_matches * 4
            + claim_matches * 2
            + context_matches
        )

        # IMPORTANT:
        # Ignore weak matches.
        # A research record must have meaningful
        # overlap with the user's query.

        if score >= 4:

            scored.append(
                (score, record)
            )

    scored.sort(
        key=lambda item: item[0],
        reverse=True
    )

    return [
        record
        for score, record in scored[:limit]
    ]