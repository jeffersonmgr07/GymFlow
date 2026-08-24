# Ficha técnica viva — GymFlow OS

- Producto: GymFlow OS
- Arquitectura: SaaS multitenant / multisede
- Backend piloto: Google Apps Script
- Almacenamiento piloto: Google Sheets
- Frontend: HTML5 + CSS3 + JavaScript Vanilla
- Versión: 0.3.0
- Fecha: 2026-08-23

## Incremento 0.3.0

La versión 0.3.0 completa el núcleo administrativo de Fase 1. Sobre la base v0.2.0 se añaden operaciones de administración reales, persistencia de configuración y una ruta de autenticación de producción mediante Firebase.

### Backend

- `GF_TenantService`: alta, edición, suspensión y reactivación de tenants.
- `GF_BranchService`: CRUD lógico de sedes.
- `GF_UserService`: CRUD lógico de usuarios y roles.
- `GF_RoleService`: catálogo y matriz base de permisos.
- `GF_SettingsService`: configuración y marca blanca.
- `GF_IdentityService`: vínculo proveedor externo ↔ usuario interno.
- `GF_FirebaseAuthService`: validación de Firebase ID Token con Identity Toolkit.
- `GF_SessionService`: revocación por tenant/usuario/rol y cambio de sede.
- `GF_AuditService`: auditoría tenant y plataforma.
- `92_Migrations.gs`: migración no destructiva v0.2.x → v0.3.0.
- `93_AdminFunctions.gs`: diagnóstico y operación manual.

### Frontend

Nuevas pantallas:

- `super-admin/gimnasios.html`
- `super-admin/permisos.html`
- `super-admin/auditoria.html`
- `admin/sedes.html`
- `admin/usuarios.html`
- `admin/permisos.html`
- `admin/configuracion.html`
- `admin/auditoria.html`

Nuevos scripts:

- `firebase-auth.js`
- `phase1-admin.js`

### Reglas críticas

- No se acepta un `tenantId` libre para CRUD tenant.
- Suspender tenant revoca sus sesiones.
- Cambiar roles revoca sesiones del usuario.
- Cambiar matriz base revoca sesiones que contienen el rol.
- No hay eliminación física.
- No se guardan contraseñas en Sheets.
- La API key backend de Firebase se guarda en Script Properties.
- La marca blanca se guarda como configuración y design tokens, no como CSS duplicado.
