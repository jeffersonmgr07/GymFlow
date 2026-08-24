# GymFlow OS — Fase 1 / Versión 0.2.0

Base profesional del SaaS multigimnasio definido en el Prompt Maestro Unificado.

## Estado

La entrega contiene frontend navegable **y** el primer núcleo backend de Fase 1.

El frontend continúa funcionando sin backend para poder publicarse inmediatamente en GitHub Pages. Cuando se configura Apps Script, el login demo opcional crea sesiones de servidor y los dashboards pueden consumir datos del tenant autenticado.

## Vistas disponibles

- `index.html` — sitio público.
- `login.html` — acceso demo.
- `admin/dashboard.html` — administración del gimnasio.
- `super-admin/dashboard.html` — administración de plataforma SaaS.

## Arquitectura

```text
Frontend estático
  ↓
ApiClient
  ↓
Apps Script Web App
  ↓
Router / Controllers
  ↓
Auth + Session + RBAC
  ↓
Services
  ↓
Repository
  ↓
Spreadsheet plataforma + Spreadsheet por tenant
```

## Probar solo frontend

```bash
python3 -m http.server 8080
```

Abre `http://localhost:8080/`.

## Backend

Los archivos están en `apps-script/`.

1. Crea/vincula un proyecto Apps Script.
2. Sube los archivos `.gs` y `appsscript.json`.
3. Ejecuta `setupGymFlowPhase1()`.
4. Ejecuta `runPhase1SmokeTests()`.
5. Despliega como Web App.
6. Comprueba `?action=system.health`.
7. Configura `assets/js/config.js`.

Guía completa: `docs/despliegue.md`.

## Configuración frontend

Por defecto:

```js
API_MODE: 'demo'
API_BASE_URL: ''
ENABLE_BACKEND_DEMO_LOGIN: false
```

Para conectar el backend demo:

```js
API_MODE: 'apps-script'
API_BASE_URL: 'https://script.google.com/macros/s/.../exec'
ENABLE_BACKEND_DEMO_LOGIN: true
```

La URL del Web App no es un secreto. No coloques API keys, contraseñas, Spreadsheet IDs privados ni tokens en `config.js`.

## Perfiles demo

- `superadmin@gymflow.demo`
- `admin@gymflow.demo`
- `gerente@gymflow.demo`
- `caja@gymflow.demo`
- `owner@oceanfit.demo` (backend seed)

La contraseña visible en `login.html` no se valida y no debe confundirse con autenticación de producción.

## Estructura

```text
gymflow-os/
├── index.html
├── login.html
├── admin/
│   └── dashboard.html
├── super-admin/
│   └── dashboard.html
├── assets/
│   ├── css/styles.css
│   └── js/
│       ├── config.js
│       ├── api-client.js
│       ├── demo-data.js
│       └── app.js
├── apps-script/
│   ├── 00_Config.gs ... 99_Tests.gs
│   ├── appsscript.json
│   └── .clasp.example.json
├── shared/contracts/
│   └── api-contract.md
├── docs/
│   ├── arquitectura.md
│   ├── modelo-datos.md
│   ├── seguridad.md
│   ├── despliegue.md
│   ├── pruebas.md
│   ├── manuales/
│   ├── capacitacion/
│   └── plantuml/
└── .gitignore
```

## Qué NO está listo para producción

- autenticación real mediante IdP;
- CRUD de tenants/sedes/usuarios;
- socios y membresías;
- pagos;
- control de acceso;
- POS;
- información sensible.

El siguiente incremento recomendado es terminar los **CRUD administrativos de Fase 1 + integración de identidad de producción**, antes de comenzar a cargar información real.
