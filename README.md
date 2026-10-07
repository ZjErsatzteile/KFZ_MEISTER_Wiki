# Bild-Fix für KFZ_MEISTER_Wiki

## Ursache

Im aktuellen Repository liegen die drei vorhandenen Grafiken im Root:

- `brakes-diagram.svg`
- `engine-oil-diagram.svg`
- `battery-diagram.svg`

`database.json` verweist dagegen auf nicht vorhandene Pfade wie
`images/repairs/brake-01.png` und der alte `app.js`-Fallback verweist auf
`images/diagrams/brake-overview.png`, das ebenfalls nicht existiert.

## Anwendung

1. `app.js.patch` auf `app.js` anwenden.
2. `database-image-fix.py` im Repository-Root ausführen:
   `python database-image-fix.py`
3. Änderungen committen und zu GitHub pushen.

Der neue `app.js`:
- behandelt relative Bildpfade korrekt auf GitHub Pages,
- zeigt vorhandene SVGs,
- zeigt bei fehlenden Dateien einen verständlichen Platzhalter,
- verwendet keine erfundene Fallback-Datei mehr.

Für `air-filter` und `spark-plugs` existiert aktuell keine passende Grafik
im Repository; deshalb werden dort bewusst Platzhalter statt falscher
Bilder angezeigt.
