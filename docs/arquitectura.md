# Arquitectura — GymFlow OS

## Versión documentada

- Aplicación: GymFlow OS
- Versión: 0.2.0
- Fase: 1 — Núcleo SaaS

## Objetivo arquitectónico

Separar presentación, contrato API, reglas de negocio y persistencia para que Google Sheets sea un almacenamiento de validación y no una dependencia directa de la UI.

```text
GitHub Pages / Cloudflare Pages
        ↓ HTTPS
assets/js/api-client.js
        ↓
Apps Script Web App
        ↓
Router / Controllers
        ↓
Auth + Session + RBAC
        ↓
Domain Services
        ↓
Repository
        ↓
┌────────────────────────────┐
│ Spreadsheet de plataforma │
└────────────────────────────┘
        ↓ resuelve tenant
┌────────────────────────────┐
│ Spreadsheet por gimnasio  │
└────────────────────────────┘
```

## Aislamiento del piloto

La plataforma mantiene un Spreadsheet maestro con:

- tenants;
- roles;
- permisos;
- relaciones rol-permiso;
- sesiones;
- identidades demo;
- auditoría de plataforma;
- migraciones.

Cada tenant obtiene un Spreadsheet separado con:

- configuración;
- sedes;
- usuarios;
- roles asignados;
- auditoría del tenant;
- snapshot de dashboard de Fase 1.

La UI no selecciona libremente el `tenantId` para consultar datos. El backend resuelve el tenant desde la sesión.

## Estructura de Apps Script

Apps Script no se trata como un runtime Node con módulos ES. Para mantener compatibilidad con `clasp`, los archivos `.gs` permanecen planos dentro de `apps-script/` y se numeran por responsabilidad:

- `00_Config.gs`
- `01_Utils.gs`
- `02_Response.gs`
- `03_Repository.gs`
- `04_RbacService.gs`
- `05_SessionService.gs`
- `06_TenantService.gs`
- `07_BranchService.gs`
- `08_UserService.gs`
- `09_AuditService.gs`
- `10_DashboardService.gs`
- `11_AuthService.gs`
- `12_Controllers.gs`
- `13_Router.gs`
- `14_Code.gs`
- `90_Setup.gs`
- `91_SeedDemo.gs`
- `99_Tests.gs`

La numeración expresa la capa conceptual y facilita mantenimiento local.

## Estrategia de frontend

`config.js` define dos modos:

- `demo`: GitHub Pages funciona sin backend y usa datos ficticios locales.
- `apps-script`: `api-client.js` usa el Web App para sesión, tenant y datos de Fase 1.

No hay secretos en `config.js`.

## Evolución prevista

El repositorio genérico será reemplazable por un repositorio SQL sin cambiar el contrato de la UI. Los servicios deben continuar trabajando con objetos de dominio y no con números de fila de Sheets.
