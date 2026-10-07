# Erweiterung für KFZ_MEISTER_Wiki

Diese Erweiterung baut auf dem bestehenden Repository auf. **Keine vorhandenen Inhalte löschen.**

1. Alle Dateien dieses Ordners zusätzlich ins Repository kopieren.
2. `database_additions.json` und `apply-enhancement.py` neben `database.json`/`app.js` ablegen.
3. Im Repository ausführen: `python apply-enhancement.py`
4. Die Ordner `images/repairs/` vollständig übernehmen.
5. Danach GitHub Pages neu deployen.

Das Script merged Datensätze nach `id`: bestehende Einträge werden nicht gelöscht. Neue Felder werden nur ergänzt, wenn sie noch fehlen.

Die Bilder sind originale schematische Werkstattgrafiken mit nummerierten Arbeitsschritten. Sie ersetzen keine fahrzeugspezifischen Herstellerunterlagen oder echten Fotoaufnahmen.
