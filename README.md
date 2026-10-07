# KFZ MeisterWiki — Werkstatt-Version 3.0

Eine deutschsprachige KFZ-Wissensdatenbank für GitHub Pages mit schwarzem/blauem Werkstatt-UI.

## Jetzt enthalten

- 19 Marken
- 115 Modelle
- 47 strukturierte Reparatur-/Diagnoseabläufe
- Werkzeuglisten
- Teile und Verbrauchsmaterial
- Vorbereitung, Ausbau und Einbau
- Befestiger-/Drehmoment-Tabelle
- Anzugsreihenfolge-Feld
- Flüssigkeiten
- Diagnose / Reset
- Abschlussprüfungen
- Fahrzeugauswahl direkt in der Reparaturansicht
- 12 Bauteilprofile
- 12 Baugruppen
- Symptom-basierte Diagnose
- Globale Suche mit `Ctrl + K` / `Cmd + K`
- Merkliste und Verlauf über LocalStorage
- Responsive Smartphone-/Tablet-Ansicht
- Zentrale Datenbank `database.json`
- GitHub-Pages-kompatible Root-Struktur
- `.nojekyll`

## Installation / Update

1. ZIP entpacken.
2. **Alle Dateien aus dem ZIP direkt in den Repository-Root hochladen.**
3. Vorhandene gleichnamige Dateien ersetzen.
4. Commit auf `main`.
5. GitHub Pages weiter aus `main` / `/(root)` veröffentlichen.

Die Struktur muss so aussehen:

```text
KFZ_MEISTER_Wiki/
├── .nojekyll
├── README.md
├── app.js
├── data-schema.json
├── database.json
├── index.html
└── style.css
```

## Wichtig zu Drehmomenten

Die Oberfläche ist bereits für fahrzeugspezifische Drehmomente vorbereitet. In dieser Version sind **keine erfundenen Drehmomentwerte** hinterlegt.

Das ist absichtlich so: Ein Modell kann je nach Generation, Motorcode, Getriebe, Achse, Bremssystem und Bauzustand unterschiedliche Befestiger und Anzugswerte haben. Herstellerunterlagen können außerdem eine Kombination aus Drehmoment + Winkel oder neue Dehnschrauben verlangen.

Daher gilt:

**Fahrzeug exakt auswählen → Motorcode/Ausstattung/Bauzustand prüfen → verifizierte Hersteller-/Werkstattquelle verwenden → Wert erst dann in `torqueRecords` eintragen.**

## Datenmodell

```text
Marke
  └─ Modell
      └─ Generation
          └─ Motorcode
              └─ Getriebe
                  └─ System
                      └─ Reparatur
                          ├─ Werkzeug
                          ├─ Teile
                          ├─ Ausbau
                          ├─ Einbau
                          ├─ Befestiger / Drehmoment
                          ├─ Diagnose / Reset
                          └─ Abschlussprüfung
```

## Ausbau zur Profi-Datenbank

Als nächste Datenstufe können je Fahrzeugvariante ergänzt werden:

- exakte Motorcodes
- VIN-/PR-Code-/SA-Code-Unterschiede
- Baujahres- und Facelift-Grenzen
- OEM-Teilenummern
- verifizierte Drehmomente
- Füllmengen und Spezifikationen
- Sicherungsbelegung
- Pinbelegungen
- Stromlaufpläne
- Anzugsreihenfolgen
- Serviceintervalle
- Rückstell-/Codierverfahren
- Bilder und Explosionszeichnungen
- Quellen je Datensatz

**Sicherheit:** Das Wiki ist ein Informationswerkzeug und ersetzt keine qualifizierte Werkstattarbeit oder fahrzeugspezifische Reparaturunterlagen.
