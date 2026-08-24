# Fase 1 — Núcleo SaaS

## Estado de la entrega 0.2.0

**Núcleo backend inicial implementado. La Fase 1 todavía no está cerrada para producción.**

La especificación maestra define:

- multi-gimnasio;
- sedes;
- usuarios;
- login;
- sesiones;
- RBAC;
- dashboard;
- temas;
- marca blanca;
- auditoría base.

## Completado

- [x] Sitio público inicial.
- [x] Login demo.
- [x] Dashboard administrativo.
- [x] Dashboard inicial Super Admin SaaS.
- [x] Responsive.
- [x] Motor de temas.
- [x] ApiClient con fallback estático.
- [x] Contrato API uniforme.
- [x] Spreadsheet maestro de plataforma mediante setup.
- [x] Spreadsheet independiente por gimnasio mediante setup.
- [x] IDs inmutables independientes de filas.
- [x] `TenantService`.
- [x] `BranchService`.
- [x] `UserService`.
- [x] `SessionService`.
- [x] `RbacService`.
- [x] `AuditService`.
- [x] `DashboardService` demo.
- [x] Sesiones expirables y revocables.
- [x] Hash de token en almacenamiento.
- [x] Resolución de tenant y sede desde sesión.
- [x] Auditoría inicial append-only en servicios.
- [x] Setup idempotente.
- [x] Dos tenants demo físicamente separados.
- [x] Smoke tests de aislamiento básicos.
- [x] Documentación de arquitectura, seguridad, despliegue y pruebas.

## Pendiente para cerrar Fase 1 de producción

- [ ] Firebase Authentication / Google Identity / IdP definitivo.
- [ ] Deshabilitar y retirar login demo de entornos reales.
- [ ] CRUD de gimnasios desde Super Admin.
- [ ] CRUD de sedes.
- [ ] CRUD de usuarios.
- [ ] Editor de asignación de roles y permisos.
- [ ] Configuración persistente completa de marca blanca.
- [ ] Soporte SaaS temporal y auditado.
- [ ] Suspensión/reactivación de tenant.
- [ ] Rate limiting.
- [ ] Más pruebas de acceso cruzado.
- [ ] Backups/restauración operativos.

## Decisión de seguridad

No se implementa autenticación propia por contraseña. El backend demo solo existe para validar la arquitectura con datos ficticios. Producción debe delegar identidad a un proveedor seguro.

## Criterio para pasar a Fase 2

Podemos comenzar a diseñar socios y membresías con datos ficticios mientras terminamos los CRUD de Fase 1, pero no deben cargarse datos reales de socios hasta tener autenticación de producción y pruebas completas de aislamiento.
