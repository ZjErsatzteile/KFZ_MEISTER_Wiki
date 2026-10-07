# KFZ MeisterWiki — Luxury Edition

Neue komplette GitHub-Pages-Version mit Premium Schwarz/Blau Automotive Design.

## Enthalten
- Dashboard
- Fahrzeug-/Marken-/Modellauswahl
- Reparaturkarten und Detailansichten
- Diagnosebereich
- Baugruppen/Systeme
- globale Suche (Ctrl/Cmd + K)
- Merkliste im Browser
- zuletzt geöffnete Inhalte
- responsive mobile Navigation
- zentrale JSON-Datenbank unter `data/database.json`

## Installation
ZIP entpacken und alle Dateien in dein Repository `KFZ_MEISTER_Wiki` kopieren bzw. die bisherigen Dateien ersetzen.
Danach GitHub → Settings → Pages → Deploy from a branch → `main` → `/ (root)`.

## Ausbau
Die Datenbank ist absichtlich so vorbereitet, dass später folgende Ebenen ergänzt werden können:
Marke → Modell → Generation → Baujahr → Motorcode → Getriebe → System → Bauteil → Symptome → Werkzeug → Arbeitsschritte → technische Werte.

Technische Werte wie Drehmomente, Füllmengen und Messwerte müssen immer anhand fahrzeugspezifischer Hersteller-/Werkstattunterlagen geprüft werden.
