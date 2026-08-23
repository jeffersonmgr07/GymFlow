# Fase 1 — Núcleo SaaS

## Estado de esta entrega

**Prototipo frontend: completado parcialmente.**

La especificación maestra define para Fase 1:

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

## Incluido ahora

- [x] Sitio público inicial.
- [x] Dashboard administrativo inicial.
- [x] Diseño responsive.
- [x] Sidebar administrativo.
- [x] Motor de temas basado en tokens CSS.
- [x] Simulación de gimnasio y sede activos.
- [x] Simulación de perfiles demo.
- [x] Simulación visual de sesión.
- [x] KPIs ficticios.
- [x] Accesos ficticios.
- [x] Estado visual de alertas.
- [x] Documentación base.

## Pendiente para completar Fase 1 funcional

- [ ] Spreadsheet maestro de plataforma.
- [ ] Spreadsheet independiente por gimnasio.
- [ ] IDs UUID/inmutables.
- [ ] API uniforme `{ ok, data, message, errorCode, correlationId }`.
- [ ] `AuthService`.
- [ ] `TenantService`.
- [ ] `BranchService`.
- [ ] `UserService`.
- [ ] RBAC en backend.
- [ ] Sesiones expirables y revocables.
- [ ] Auditoría append-only.
- [ ] Resolución de tenant y sede desde sesión.
- [ ] Pruebas de aislamiento cruzado.
- [ ] Conexión del dashboard con API real.
- [ ] Super Admin SaaS inicial.

## Criterio para pasar a Fase 2

No se debe comenzar socios y membresías con datos reales hasta que exista aislamiento de tenant probado y autorización de backend.

## Datos demo

Todos los nombres, correos, cifras, accesos, indicadores y operaciones del frontend son ficticios y solo sirven para diseño/pruebas.
