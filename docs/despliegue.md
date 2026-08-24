# Despliegue — GymFlow OS 0.2.0

## A. Frontend en GitHub Pages

Sube el contenido del repositorio a `main` y publica la raíz con GitHub Pages.

La configuración por defecto es segura para demostración estática:

```js
API_MODE: 'demo'
API_BASE_URL: ''
ENABLE_BACKEND_DEMO_LOGIN: false
```

## B. Crear proyecto Apps Script

Puedes crear un proyecto independiente en Google Apps Script y copiar los archivos de `apps-script/`, o usar `clasp`.

### Con clasp

1. Instala Node.js y `@google/clasp` localmente.
2. Autentica `clasp` con tu cuenta Google.
3. Crea o vincula un proyecto Apps Script.
4. Copia `.clasp.example.json` a `.clasp.json` y coloca tu `scriptId`.
5. Ejecuta `clasp push` desde `apps-script/`.

`.clasp.json` está ignorado por Git.

## C. Inicializar datos demo

Desde el editor Apps Script ejecuta:

```text
setupGymFlowPhase1()
```

La función crea de forma idempotente:

- carpeta `GymFlow OS - Data Demo`;
- Spreadsheet maestro de plataforma;
- Spreadsheet de Iron Factory;
- Spreadsheet de Ocean Fit Club;
- encabezados;
- roles;
- permisos;
- usuarios demo;
- sedes;
- snapshots demo.

Los IDs se guardan en Script Properties.

## D. Probar backend

Ejecuta:

```text
runPhase1SmokeTests()
```

Todos los tests deben resultar `ok: true` antes del despliegue.

## E. Publicar como Web App

Crea un deployment de tipo Web App desde Apps Script. Copia la URL terminada en `/exec`.

Primero prueba en el navegador:

```text
URL_DEL_WEB_APP?action=system.health
```

Debe responder JSON con `ok: true`.

## F. Conectar GitHub Pages

Edita `assets/js/config.js`:

```js
API_MODE: 'apps-script',
API_BASE_URL: 'TU_URL_EXEC',
ENABLE_BACKEND_DEMO_LOGIN: true
```

Vuelve a publicar el frontend.

## G. Antes de producción

No dejes `ENABLE_BACKEND_DEMO_LOGIN=true` ni `DEMO_MODE=true` cuando existan datos reales. La autenticación de producción todavía es un requisito pendiente de Fase 1.
