# Contrato API — GymFlow OS 0.3.0

Todas las operaciones usan `POST` al Web App de Google Apps Script con `Content-Type: text/plain` y cuerpo JSON.

```json
{
  "action": "branches.list",
  "payload": {},
  "sessionToken": "TOKEN_OPACO",
  "requestId": "uuid-del-cliente",
  "client": {
    "appVersion": "0.3.0",
    "page": "admin-branches"
  }
}
```

Respuesta uniforme:

```json
{
  "ok": true,
  "data": {},
  "message": "Operación completada.",
  "errorCode": null,
  "correlationId": "..."
}
```

## Acciones anónimas

- `system.health`
- `auth.demoLogin` — solo si `DEMO_MODE=true`.
- `auth.firebaseLogin` — intercambia un Firebase ID Token validado por una sesión GymFlow.

## Sesión

- `auth.me`
- `auth.logout`
- `session.branch.switch`

## Tenant actual

- `tenant.current`
- `tenant.settings.get`
- `tenant.settings.update`

## Super Admin SaaS

- `platform.tenants.list`
- `platform.tenants.get`
- `platform.tenants.create`
- `platform.tenants.update`
- `platform.tenants.status`
- `platform.permissions.matrix.update`

## Sedes

- `branches.list`
- `branches.create`
- `branches.update`
- `branches.status`

## Usuarios y RBAC

- `users.list`
- `users.create`
- `users.update`
- `users.status`
- `users.roles.set`
- `roles.list`
- `permissions.matrix`

## Dashboard y auditoría

- `dashboard.summary`
- `audit.list`

## Reglas de seguridad relevantes

- El `tenantId` operativo no se acepta libremente desde el navegador para operaciones tenant; se resuelve desde la sesión.
- Las mutaciones validan RBAC en backend.
- Suspender un tenant revoca sus sesiones activas.
- Cambiar roles revoca las sesiones del usuario afectado.
- Cambiar la matriz base revoca las sesiones que contengan el rol modificado.
- No existe eliminación física en los CRUD de Fase 1; se usan estados `ACTIVE` / `SUSPENDED`.
