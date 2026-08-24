# GymFlow OS — Fase 1 / Versión 0.3.0

GymFlow OS es un SaaS multigimnasio y multisede. Esta entrega completa el núcleo administrativo de Fase 1 y deja el proyecto preparado para iniciar Fase 2: Socios, Planes, Membresías, Flex 14 y Carné digital.

## Incluido en v0.3.0

- Frontend público y login.
- Dashboard de Administrador y Super Admin.
- Backend Google Apps Script por capas.
- Spreadsheet maestro de plataforma + Spreadsheet independiente por tenant.
- CRUD lógico de gimnasios, sedes y usuarios.
- Suspensión/reactivación de gimnasios, sedes y usuarios.
- Asignación de roles a usuarios.
- Matriz base de permisos RBAC.
- Configuración persistente por tenant.
- Marca blanca mediante design tokens.
- Selector real de sede con contexto de sesión.
- Auditoría visual tenant/plataforma.
- Integración Firebase Authentication preparada y desactivada por defecto.
- Login demo de backend para desarrollo.
- Migración no destructiva desde v0.2.x.
- Pruebas manuales ejecutables desde Apps Script.
- Documentación viva.

## Estructura principal

```text
gymflow-os-phase1/
├── index.html
├── login.html
├── admin/
│   ├── dashboard.html
│   ├── sedes.html
│   ├── usuarios.html
│   ├── permisos.html
│   ├── auditoria.html
│   └── configuracion.html
├── super-admin/
│   ├── dashboard.html
│   ├── gimnasios.html
│   ├── permisos.html
│   └── auditoria.html
├── assets/
│   ├── css/styles.css
│   └── js/
│       ├── config.js
│       ├── api-client.js
│       ├── firebase-auth.js
│       ├── phase1-admin.js
│       ├── demo-data.js
│       └── app.js
├── apps-script/
│   ├── 00_Config.gs ... 18_FirebaseAuthService.gs
│   ├── 90_Setup.gs
│   ├── 91_SeedDemo.gs
│   ├── 92_Migrations.gs
│   ├── 93_AdminFunctions.gs
│   ├── 99_Tests.gs
│   └── appsscript.json
├── shared/contracts/api-contract.md
└── docs/
```

## Primera instalación Apps Script

1. `clasp push`
2. Ejecutar `setupGymFlowPhase1()` una sola vez.
3. Ejecutar `runPhase1SmokeTests()`.
4. Ejecutar `runPhase1CompletionTests()`.
5. Ejecutar `getGymFlowSetupStatus()`.
6. Desplegar como Web App y configurar su URL en `assets/js/config.js`.

## Si ya instalaste v0.2.x

No borres tus Google Sheets.

1. Copia los archivos v0.3.0 sobre tu carpeta local `apps-script` conservando `.clasp.json`.
2. Ejecuta `clasp push`.
3. En Apps Script ejecuta `migrateGymFlowPhase1ToV030()`.
4. Ejecuta `runPhase1SmokeTests()`.
5. Ejecuta `runPhase1CompletionTests()`.
6. Ejecuta `getGymFlowSetupStatus()`.

## Firebase

Firebase está integrado pero desactivado por defecto. No necesitas activarlo para probar los CRUD con el login demo. Consulta `docs/firebase-auth.md` antes de habilitar producción.

## Importante

- No guardar contraseñas, API keys privadas o tokens en GitHub.
- `.clasp.json` se mantiene local.
- No editar simultáneamente versiones diferentes en Apps Script y GitHub; el repositorio/local debe ser la fuente principal y `clasp push` el mecanismo de publicación.
