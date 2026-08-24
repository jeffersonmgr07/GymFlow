# Despliegue — GymFlow OS 0.3.0

## Backend Apps Script con clasp

### Instalación existente v0.2.x

1. Conserva el archivo `.clasp.json` de tu carpeta local actual.
2. Copia los nuevos archivos de `apps-script/` encima de esa carpeta.
3. Desde Terminal:

```bash
clasp push
```

4. Abre Apps Script:

```bash
clasp open-script
```

5. Ejecuta:

```text
migrateGymFlowPhase1ToV030
runPhase1SmokeTests
runPhase1CompletionTests
getGymFlowSetupStatus
```

No vuelvas a crear el proyecto Apps Script.

### Primera instalación

Después de `clasp push` ejecuta:

```text
setupGymFlowPhase1
runPhase1SmokeTests
runPhase1CompletionTests
getGymFlowSetupStatus
```

## Despliegue Web App

Cuando los tests terminen con `ok: true`:

1. Apps Script → **Implementar / Deploy**.
2. **Nueva implementación**.
3. Tipo: **Aplicación web / Web app**.
4. Ejecutar como: propietario del proyecto.
5. Acceso: el nivel compatible con el frontend público utilizado durante el piloto.
6. Copiar la URL `/exec`.
7. En `assets/js/config.js`:

```js
API_MODE: 'apps-script',
API_BASE_URL: 'https://script.google.com/macros/s/DEPLOYMENT_ID/exec',
ENABLE_BACKEND_DEMO_LOGIN: true
```

Para pruebas de desarrollo se puede mantener login demo. Antes de producción debe deshabilitarse.

## Actualizaciones futuras

Cuando cambies archivos `.gs`:

```bash
clasp push
```

Si el cambio afecta el código del Web App, crea/actualiza la implementación con una nueva versión según el flujo de Apps Script para que la URL productiva use el código actualizado.
