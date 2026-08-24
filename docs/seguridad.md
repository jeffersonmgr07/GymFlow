# Seguridad — GymFlow OS Fase 1 v0.3.0

## Controles implementados

- RBAC validado en backend.
- Aislamiento de tenant desde sesión.
- Spreadsheet separado por tenant en el piloto.
- Tokens de sesión opacos, expirables y revocables.
- Solo hash SHA-256 del token persistido.
- Suspensión de tenant revoca sesiones tenant.
- Suspensión de usuario revoca sesiones de usuario.
- Cambio de roles revoca sesiones del usuario.
- Cambio de matriz de permisos revoca sesiones que contienen el rol modificado.
- IDs de negocio inmutables y no basados en fila.
- Auditoría append-only.
- Eliminación lógica mediante estados.
- Firebase ID Token validado en backend antes de crear sesión GymFlow.
- Contraseñas fuera de Google Sheets y Apps Script.

## Firebase

Apps Script valida el Firebase ID Token mediante `Identity Toolkit accounts:lookup`. La API key del backend se almacena en Script Properties. La configuración web de Firebase puede existir en frontend porque no representa una contraseña; aun así deben aplicarse restricciones de API key desde Google Cloud cuando corresponda.

## Pendiente antes de producción comercial

- Deshabilitar login demo.
- Configurar Firebase Auth real.
- Restringir dominios autorizados de Firebase.
- Revisar reglas de password/2FA según plan.
- Añadir rate limiting persistente para endpoints de autenticación.
- Añadir política de soporte temporal.
- Pruebas de IDOR y cross-tenant automatizadas.
- Backup y restauración probados.
- Política de privacidad/consentimientos para Fase 7+.
