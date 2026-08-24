# Seguridad — Fase 1

## Implementado

- tenant resuelto desde la sesión;
- Spreadsheet separado por tenant en el piloto;
- permisos RBAC validados en backend;
- token de sesión opaco y aleatorio;
- almacenamiento únicamente del SHA-256 del token;
- expiración de sesión;
- revocación de sesión;
- auditoría de login/logout;
- errores uniformes sin stack trace al usuario;
- correlation ID;
- ningún secreto en GitHub;
- ningún password almacenado en Sheets.

## Modo demo

`auth.demoLogin` existe para probar arquitectura y datos ficticios. Solo funciona cuando Script Property `DEMO_MODE=true`.

Antes de usar datos reales:

1. cambiar `DEMO_MODE=false`;
2. integrar Firebase Authentication, Google Identity u otro IdP aprobado;
3. verificar el token del proveedor en backend;
4. resolver usuario, tenant y roles desde fuentes internas;
5. eliminar cualquier dependencia operativa de `DemoIdentities`.

## Datos sensibles

Fase 1 no almacena evaluaciones físicas, nutrición, biometría ni fotografías sensibles. Cuando esos módulos se incorporen necesitarán permisos explícitos adicionales y auditoría específica.

## Limitaciones conocidas

- Google Sheets no es una base transaccional de alta concurrencia.
- La integridad append-only es una regla de aplicación; un propietario del archivo de Drive todavía puede editar manualmente una hoja. En producción avanzada se requerirá almacenamiento y controles más fuertes.
- El Web App de Apps Script debe desplegarse con una configuración de acceso compatible con el frontend y validarse antes de producción.
- El rate limiting fuerte todavía no está implementado.
- CSRF y estrategia definitiva de autenticación dependen del proveedor de identidad elegido.
