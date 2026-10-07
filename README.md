# KFZ MeisterWiki — Große Version 2.0

Eine statische, deutschsprachige KFZ-Wissensdatenbank für GitHub Pages.

## Umfang

- 19 Marken
- 115 Modelle im Katalog
- 47 strukturierte Reparatur-/Diagnoseabläufe
- 12 Bauteilprofile
- 12 Baugruppen
- Symptom-basierter Diagnosebereich
- Globale Suche mit `Ctrl + K` / `Cmd + K`
- Merkliste und Verlauf über LocalStorage
- Responsive Smartphone-/Tablet-Ansicht
- Zentrale Datenbank: `data/database.json`
- Keine Server- oder Datenbankinstallation notwendig

## Installation

1. ZIP entpacken.
2. Den **Inhalt** in dein Repository `KFZ_MEISTER_Wiki` kopieren.
3. Alte `index.html`, `app.js` und `style.css` ersetzen.
4. Die neuen Ordner `assets/`, `data/` und die Datei `.nojekyll` hochladen.
5. Commit auf den Branch durchführen, den GitHub Pages verwendet.

GitHub Pages kann statische HTML/CSS/JS-Dateien direkt aus einem Repository veröffentlichen. Wenn du vom Branch veröffentlichst, kann als Quelle der Repository-Root verwendet werden.

## Datenmodell

Die Datenbank ist absichtlich so aufgebaut, dass sie später weiter wachsen kann:

**Marke → Modell → Generation → Baujahr → Motorcode → Getriebe → System → Bauteil → Symptome → Werkzeug → Arbeitsschritte → technische Werte**

## Wichtig zu technischen Werten

Diese Version enthält bewusst **keine erfundenen fahrzeugspezifischen Drehmomente, Füllmengen oder Messwerte**. Solche Werte müssen anhand der exakten Fahrzeugidentifikation und geeigneter Hersteller-/Werkstattunterlagen geprüft werden.

## Ausbau auf eine echte Profi-Datenbank

Für die nächste Datenstufe können je Fahrzeugvariante ergänzt werden:

- VIN-/PR-Code-/SA-Code-bezogene Unterschiede
- exakte Motorcodes
- Baujahres- und Facelift-Grenzen
- OEM-Teilenummern
- Drehmomente
- Füllmengen
- Sicherungsbelegung
- Pinbelegungen
- Stromlaufpläne
- Anzugsreihenfolgen
- Serviceintervalle
- Rückstell-/Codierverfahren
- Bilder und Explosionszeichnungen
- Herstellerquellen

**Hinweis:** Das Wiki ist ein Informationswerkzeug und ersetzt keine qualifizierte Werkstattarbeit oder fahrzeugspezifische Reparaturunterlagen.
