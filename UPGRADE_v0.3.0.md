# Actualización a GymFlow OS v0.3.0

## Caso A — ya ejecutaste setup de v0.2.x

1. Conserva `apps-script/.clasp.json` de tu carpeta actual.
2. Copia los archivos nuevos de `apps-script/` sobre la carpeta existente.
3. Terminal:

```bash
cd /ruta/a/tu/proyecto/apps-script
clasp push
clasp open-script
```

4. En Apps Script ejecuta en este orden:

```text
migrateGymFlowPhase1ToV030
runPhase1SmokeTests
runPhase1CompletionTests
getGymFlowSetupStatus
```

Los dos tests deben devolver `ok: true`.

## Caso B — nunca ejecutaste setupGymFlowPhase1

Después de `clasp push`, ejecuta:

```text
setupGymFlowPhase1
runPhase1SmokeTests
runPhase1CompletionTests
getGymFlowSetupStatus
```

## Después de los tests

Despliega el Web App, copia la URL `/exec` y cambia en `assets/js/config.js`:

```js
API_MODE: 'apps-script',
API_BASE_URL: 'TU_URL_EXEC',
ENABLE_BACKEND_DEMO_LOGIN: true
```

Sube el frontend actualizado a GitHub Pages.

## Firebase

No lo actives todavía si primero quieres probar los CRUD. El login demo backend es suficiente para validar Fase 1.

Cuando quieras activar Firebase, sigue `docs/firebase-auth.md`.
