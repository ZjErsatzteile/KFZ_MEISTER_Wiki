# KFZ MEISTER Wiki Pro

Erweiterte statische GitHub-Pages-Version des KFZ MEISTER Wiki.

## Enthalten
- Diagnose-Datenbank mit Symptomen, Ursachen, Prüfungen und Reparaturentscheidung
- Reparaturseiten
- Komponenten mit Werkzeug, Teilen, Ablauf und Nachkontrolle
- Fahrzeugsysteme mit technischer Übersicht
- Werkzeug-Datenbank
- Fahrzeug-/Hersteller-Navigation
- globale Suche
- rechtliche und dokumentarische Hinweise
- PWA-Grundstruktur
- keine Build-Tools erforderlich

## Installation
1. Alle Dateien in das Repository kopieren.
2. `Settings -> Pages -> Deploy from a branch`.
3. Branch `main`, Ordner `/ (root)`.
4. Seite öffnen.

## Wichtig zu Drehmomenten
Diese Version erfindet keine fahrzeugübergreifenden Drehmomente. Für sicherheitskritische Befestiger müssen exakte Fahrzeugdaten und Hersteller-/Werkstattunterlagen verwendet werden.

## Datenmodell
`database.json` ist absichtlich getrennt von `app.js`. Neue Inhalte können dort ergänzt werden.

## Rechtlicher Hinweis
Die Inhalte sind technische Wissensinformationen und keine individuelle Rechtsberatung oder verbindliche Hersteller-Reparaturanleitung.
