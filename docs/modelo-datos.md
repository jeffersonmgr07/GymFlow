# Modelo de datos — Fase 1 v0.3.0

## Plataforma

### Tenants

Incluye identidad, slug, estado, Spreadsheet, tema, moneda, locale, zona horaria, plan SaaS, límites, datos de suspensión y trazabilidad de creación/actualización.

### Roles / Permissions / RolePermissions

Catálogo RBAC global. `RolePermissions` usa estado lógico `ACTIVE/INACTIVE` para conservar cambios históricos sin borrar filas.

### Sessions

El token completo nunca se persiste; se almacena SHA-256 del token. Incluye tenant, sede, roles, expiración y revocación.

### AuthIdentities

Vincula proveedor externo con usuario interno:

- provider
- provider_uid
- email
- user_id
- tenant_id
- branch_id
- status
- bound_at

Permite que Firebase sea reemplazable sin convertir su UID en el ID de negocio del usuario.

### AuditLogs / Migrations

Auditoría técnica de plataforma y registro idempotente de migraciones.

## Tenant

### TenantSettings

Configuración por clave JSON. Fase 1 usa:

- `branding`
- `operations`
- `localization`

### Branches

Sedes con IDs inmutables, código, estado, timezone, dirección, teléfono y email.

### Users

Usuario interno con tenant, sede primaria, email, nombre, estado y referencia opcional a proveedor de autenticación.

### UserRoles

Asignaciones lógicas de roles. No se eliminan al desasignar; pasan a `INACTIVE`.

### AuditLogs

Historial append-only de acciones tenant.

### DashboardSnapshot

Datos demo de indicadores hasta que los módulos reales de Socios/Pagos/Accesos generen agregados.
