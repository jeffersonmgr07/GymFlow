# Modelo de datos — Fase 1

## Principio

Todos los IDs son inmutables y distintos del número de fila. Los timestamps se manejan en ISO 8601. Los registros históricos no deben borrarse silenciosamente.

## Spreadsheet de plataforma

### Tenants

Identifica cada gimnasio y la ubicación de su almacenamiento piloto.

Campos principales: `tenant_id`, `name`, `slug`, `status`, `spreadsheet_id`, `theme_key`, `currency`, `locale`, `timezone`, timestamps y `version`.

### Roles / Permissions / RolePermissions

Catálogo RBAC común. Los permisos usan códigos semánticos como:

- `platform.tenants.read`
- `tenant.read`
- `branch.read`
- `user.read`
- `dashboard.read`
- `audit.read`
- `theme.manage`
- `user.manage`
- `branch.manage`

### Sessions

Guarda `token_hash`, nunca el token opaco en claro. Contiene el contexto de usuario, tenant, sede, roles, expiración y estado.

### DemoIdentities

Directorio exclusivo del entorno demo para resolver correo → usuario/tenant/sede. No es el mecanismo de autenticación de producción.

### AuditLogs

Eventos de plataforma no asociados a un tenant, por ejemplo acceso del Super Admin.

## Spreadsheet de tenant

### TenantSettings

Configuración de marca blanca y parámetros del gimnasio.

### Branches

Sedes pertenecientes al tenant. Toda fila contiene `tenant_id` aunque el archivo ya sea específico del gimnasio, como defensa adicional y apoyo a una futura migración SQL.

### Users

Usuarios administrativos iniciales de Fase 1. No contiene contraseñas.

### UserRoles

Asignación de roles por usuario y, cuando corresponde, sede.

### AuditLogs

Bitácora append-only del tenant desde la capa de servicios.

### DashboardSnapshot

Datos ficticios de demostración utilizados exclusivamente para validar la conexión frontend/backend antes de implementar socios, pagos y accesos en sus fases correspondientes. No es la fuente final de KPI.

## Datos que todavía NO pertenecen a Fase 1

No se han creado aún las entidades operativas finales de:

- socios;
- membresías;
- pagos;
- check-ins;
- caja;
- CRM;
- rutinas;
- clases;
- nutrición;
- mantenimiento.

Se incorporarán según el roadmap maestro para evitar mezclar módulos sin reglas terminadas.
