# KFZ MeisterWiki

Eine moderne, dunkel-blaue KFZ-Reparatur-Wissensplattform für GitHub Pages.

## Enthalten
- Responsive Premium-UI
- Markenübersicht
- Reparaturkarten
- Live-Suche
- Mobile Navigation
- Sicherheits-Hinweis
- Keine Build-Tools nötig

## GitHub Pages
1. Dateien in ein neues GitHub-Repository hochladen.
2. `Settings` → `Pages`.
3. Bei **Build and deployment** `Deploy from a branch` wählen.
4. Branch `main` und Ordner `/ (root)` auswählen.
5. Speichern.

Die Seite ist statisch und läuft direkt über GitHub Pages.

## Ausbau zur großen Datenbank
Die Demo-Daten in `assets/app.js` können später durch eine JSON-Datenbank ersetzt werden, z. B.:

`marke → modell → motor → baujahr → system → bauteil → symptome → werkzeug → arbeitsschritte → drehmomente`

Bei technischen Angaben immer fahrzeugspezifische Werkstattunterlagen bzw. Herstellerdaten prüfen.
