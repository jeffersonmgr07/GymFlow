# Arquitectura — GymFlow OS

## Versión 0.3.0

```text
GitHub Pages / Cloudflare Pages
        │
        ├── HTML/CSS/JS
        ├── Firebase Auth (opcional/producción)
        └── GymFlow ApiClient
                │
                ▼
Google Apps Script Web App
        │
        ├── Router / Controllers
        ├── Auth / Sessions
        ├── RBAC
        ├── Domain Services
        ├── Audit
        └── Repository
                │
                ├──────── Spreadsheet Plataforma
                │          Tenants
                │          Roles
                │          Permissions
                │          RolePermissions
                │          Sessions
                │          AuthIdentities
                │          AuditLogs
                │          Migrations
                │
                └──────── 1 Spreadsheet por tenant
                           TenantSettings
                           Branches
                           Users
                           UserRoles
                           AuditLogs
                           DashboardSnapshot
```

## Autenticación

### Desarrollo

`auth.demoLogin` usa identidades ficticias y genera una sesión opaca de Apps Script.

### Producción

```text
Email / contraseña
      ↓
Firebase Authentication
      ↓
Firebase ID Token
      ↓
auth.firebaseLogin
      ↓
Identity Toolkit accounts:lookup
      ↓
AuthIdentities
      ↓
Usuario + tenant + roles
      ↓
Sesión opaca GymFlow
```

La contraseña nunca se entrega a Apps Script.

## Aislamiento multitenant

El contexto tenant se obtiene de la sesión. Los servicios tenant llaman `getTenantSpreadsheet(ctx.tenantId)`. El navegador no controla libremente el tenant operativo.

## Administración de plataforma

El Super Admin gestiona metadatos del tenant y su ciclo de vida desde el Spreadsheet maestro, sin recibir acceso automático a datos sensibles futuros de salud.

## Sede activa

El selector de sede usa `session.branch.switch`. El propietario puede cambiar entre sedes activas; otros roles quedan restringidos a su sede primaria en esta versión.
