# Fase 1 — Núcleo SaaS

## Estado de la entrega 0.3.0

Con esta versión, Fase 1 queda funcionalmente cerrada a nivel de núcleo administrativo para continuar con Fase 2.

### Implementado

1. Multi-gimnasio con Spreadsheet independiente por tenant.
2. Sedes múltiples.
3. Usuarios tenant.
4. Sesiones opacas y revocables.
5. RBAC validado en backend.
6. CRUD lógico de gimnasios.
7. CRUD lógico de sedes.
8. CRUD lógico de usuarios.
9. Asignación de roles.
10. Matriz base de permisos.
11. Suspensión/reactivación de tenants, sedes y usuarios.
12. Configuración persistente del tenant.
13. Marca blanca por design tokens.
14. Selector real de sede que actualiza la sesión.
15. Auditoría visual tenant y plataforma.
16. Adaptador Firebase Authentication.
17. Migración v0.2.x → v0.3.0 no destructiva.
18. Pruebas smoke y completion.

## Eliminación

No existe borrado físico desde los CRUD. Se usan estados `ACTIVE` y `SUSPENDED` para preservar historial y trazabilidad.

## Firebase

La integración está implementada, pero se mantiene `FIREBASE_AUTH_ENABLED=false` hasta que el proyecto Firebase y sus propiedades estén configurados. El login demo puede mantenerse durante desarrollo.

## Criterio de cierre de Fase 1

Antes de iniciar Fase 2 deben pasar:

- `runPhase1SmokeTests()` → `ok: true`
- `runPhase1CompletionTests()` → `ok: true`
- acceso demo al Super Admin y Administrador vía Web App desplegado;
- creación/edición de una sede de prueba;
- creación/edición de un usuario de prueba;
- cambio de sede del propietario;
- visualización de auditoría;
- persistencia de marca blanca.

## Siguiente fase

Fase 2 incorporará:

- Socios.
- Planes.
- Membresías.
- Flex 14.
- Ilimitados.
- Congelamientos.
- Renovaciones.
- Carné digital.
- QR / Code 128.

Se recomienda incluir desde Fase 2 un Growth Core mínimo: lead → contacto → prueba → socio → membresía → pago, para alinear el producto con la propuesta comercial de crecimiento del gimnasio.
