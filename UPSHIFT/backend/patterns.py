def analyze_patterns():
    people = load_people()
    records = load_research_records()

    pattern_counter = Counter()

    for record in records:
        for tag in record.get("tags", []):
            pattern_counter[tag] += 1

    patterns = []

    for tag, count in pattern_counter.most_common():
        evidence = (
            "Very Strong" if count >= 5
            else "Strong" if count >= 3
            else "Moderate" if count == 2
            else "Early"
        )

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