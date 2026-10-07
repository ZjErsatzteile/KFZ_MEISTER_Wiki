# KFZ MEISTER Wiki – fertige PWA

Uploadfertiger statischer Stand für GitHub Pages, Android, iPhone/iPad und PC.

## Enthalten

- `index.html` – Einstiegspunkt
- `app.js` – Fahrzeug-Navigation und Anwendung
- `style.css` – responsive Oberfläche
- `database.json` – Datenquelle der Anwendung
- `manifest.webmanifest` – PWA-Manifest
- `sw.js` – Offline-/Cache-Service-Worker
- `icons/` – PWA-Symbole

## Fahrzeug-Navigation

Hersteller → Modell → Baureihe → Motor → Getriebe → Fahrzeugauswahl.

Baureihen sind anklickbar. Motor und Getriebe werden getrennt ausgewählt und bleiben dabei erhalten.

## GitHub Pages

1. Alle Dateien aus diesem ZIP in das Repository hochladen.
2. Vorhandene Dateien mit gleicher Bezeichnung ersetzen.
3. `Settings → Pages → Deploy from a branch → main → / (root)` auswählen.
4. Nach dem Deployment die GitHub-Pages-Adresse öffnen.

## PWA-Installation

- Android/Chrome: Browser-Menü → Installieren / Zum Startbildschirm.
- iPhone/iPad/Safari: Teilen → Zum Home-Bildschirm.
- PC/Chrome/Edge: Installationssymbol bzw. Browser-Menü → Installieren.

## Datenbank-Hinweis

Die enthaltene `database.json` ist ein funktionsfähiger Beispieldatensatz für die neue Datenstruktur. Eigene bzw. vollständige Werkstattdaten können dort ergänzt oder ersetzt werden.

Technische Angaben wie Motor-, Getriebe-, Drehmoment- oder Reparaturdaten sollten vor produktivem Einsatz mit fahrzeugspezifischen Hersteller-/Werkstattunterlagen geprüft werden.
