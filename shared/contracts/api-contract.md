# Contrato API — GymFlow OS 0.2.0

## Envelope de solicitud

```json
{
  "action": "dashboard.summary",
  "payload": {},
  "sessionToken": "TOKEN_OPACO",
  "requestId": "UUID_CLIENTE",
  "client": {
    "appVersion": "0.2.0",
    "page": "admin-dashboard"
  }
}
```

`sessionToken` no se envía para `system.health` ni `auth.demoLogin`.

## Respuesta uniforme

```json
{
  "ok": true,
  "data": {},
  "message": "Operación completada.",
  "errorCode": null,
  "correlationId": "..."
}
```

## Acciones de Fase 1

| Acción | Sesión | Permiso | Uso |
|---|---|---|---|
| `system.health` | No | — | Verificación de despliegue |
| `auth.demoLogin` | No | modo demo | Sesión ficticia de backend |
| `auth.me` | Sí | — | Contexto actual |
| `auth.logout` | Sí | — | Revocar sesión |
| `tenant.current` | Sí | `tenant.read` | Tenant actual |
| `platform.tenants.list` | Sí | `platform.tenants.read` | Super Admin |
| `branches.list` | Sí | `branch.read` | Sedes del tenant |
| `users.list` | Sí | `user.read` | Usuarios del tenant |
| `dashboard.summary` | Sí | `dashboard.read` | Snapshot demo de Fase 1 |
| `audit.list` | Sí | `audit.read` | Últimos eventos auditables |

## Regla multitenant

Las acciones de tenant no aceptan un `tenantId` confiable desde el navegador. El backend toma `tenantId` y `branchId` de la sesión resuelta.
