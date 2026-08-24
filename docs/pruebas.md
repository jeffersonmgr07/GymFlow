# Plan de pruebas — Fase 1 v0.3.0

## Pruebas de Apps Script

### `runPhase1SmokeTests()`

Valida:

- plataforma existente;
- al menos dos tenants demo;
- Spreadsheets aislados;
- ausencia de fuga de usuario entre tenants;
- restricciones RBAC de cajero;
- permisos administrativos de propietario.

### `runPhase1CompletionTests()`

Valida:

- migración `phase1_v030` registrada;
- hoja `AuthIdentities` y vínculos pendientes;
- nuevos permisos administrativos;
- marca blanca persistente;
- permisos de propietario;
- permisos de Super Admin.

Resultado esperado:

```json
{ "ok": true }
```

## Prueba manual CRUD

1. Entrar como Super Admin demo.
2. Crear un gimnasio de prueba.
3. Editarlo.
4. Suspenderlo y reactivarlo.
5. Entrar como propietario de Iron Factory.
6. Crear una sede.
7. Crear un usuario y asignar rol.
8. Editar roles del usuario.
9. Cambiar sede activa.
10. Guardar marca blanca.
11. Abrir auditoría y confirmar eventos.

## Criterio cross-tenant

Nunca se considera exitosa Fase 1 si un usuario de Iron Factory puede leer/modificar datos de Ocean Fit con su sesión tenant.
