#!/usr/bin/env python3
import json
from pathlib import Path

p = Path("database.json")
db = json.loads(p.read_text(encoding="utf-8"))

mapping = {
    "brake-pads-front-generic": "brakes-diagram.svg",
    "oil-change": "engine-oil-diagram.svg",
    "battery-replacement": "battery-diagram.svg",
}

for repair in db.get("repairs", []):
    rid = repair.get("id")
    for step in repair.get("steps", []):
        image = step.get("image")
        if not isinstance(image, dict):
            continue

        if rid in mapping:
            image["path"] = mapping[rid]
        elif rid in {"air-filter", "spark-plugs"}:
            # There is currently no matching asset in the repository.
            # app.js will render a clear placeholder instead of a broken image.
            image["path"] = None

p.write_text(
    json.dumps(db, ensure_ascii=False, indent=2) + "\n",
    encoding="utf-8",
)
print("database.json aktualisiert.")
