# Fertiger GitHub-Pages-Workflow

Diese ZIP enthält absichtlich **nur den neuen GitHub-Pages-Workflow**.

Beim Entpacken in dein bestehendes KFZ_MEISTER_Wiki entsteht:

.github/workflows/deploy.yml

Es werden keine vorhandenen Wiki-Dateien gelöscht oder verändert.

Der Workflow:
- läuft bei jedem Push auf `main`
- kann zusätzlich manuell gestartet werden
- benötigt keinen Node.js-Build
- verwendet `actions/upload-pages-artifact`
- verwendet `actions/deploy-pages`
- verwendet NICHT `actions/upload-artifact`

Damit wird die bisherige `upload-artifact@v4`-Warnung aus diesem eigenen Workflow vermieden.

Nach dem Hochladen:
1. GitHub → Settings → Pages
2. unter Build and deployment als Source `GitHub Actions` auswählen
3. anschließend unter Actions den Workflow prüfen

Wichtig: Falls GitHub Pages aktuell noch einen automatisch erzeugten `pages-build-deployment`-Lauf zeigt, kann dieser in der Historie weiterhin sichtbar sein. Das ist nicht derselbe Workflow. Die Pages-Einstellung muss auf `GitHub Actions` zeigen.
