# GitHub Actions modernisiert

Diese Workflow-Datei ist für das statische KFZ_MEISTER_Wiki ausgelegt.

Wichtig:
- Keine Wiki-Dateien löschen.
- Es wird kein Node.js-Build benötigt.
- `actions/upload-artifact@v4` wird nicht mehr verwendet.
- Stattdessen wird das offizielle GitHub-Pages-Artefakt verwendet.
- Der Workflow nutzt aktuelle Pages-Actions.
- `database.json`, `app.js`, `style.css`, `index.html` und `images/` werden vor der Veröffentlichung geprüft.

## Einbau

1. Im bestehenden Repository den aktuell verwendeten Workflow unter `.github/workflows/` öffnen.
2. Den Inhalt dieses Workflows durch `deploy-pages-modern.yml` ersetzen.
3. Den Dateinamen des bestehenden Workflows kannst du beibehalten.
4. Nichts aus dem Wiki löschen.
5. Commit auf `main`.
6. Unter GitHub → Settings → Pages muss bei Build and deployment als Quelle `GitHub Actions` ausgewählt sein.

Warum kein `actions/upload-artifact@v4`?
Für GitHub Pages wird direkt `actions/upload-pages-artifact` verwendet. GitHub dokumentiert dafür aktuell die Pages-Kette `configure-pages`, `upload-pages-artifact` und `deploy-pages`. Dadurch entfällt der alte separate Artifact-Schritt, der die Node-20-Warnung ausgelöst hat.

Die alte Workflow-Datei muss nicht aus der Git-Historie gelöscht werden. Ihr Inhalt wird lediglich auf die moderne Variante umgestellt.
