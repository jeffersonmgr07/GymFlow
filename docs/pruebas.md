# Plan de pruebas — Fase 1

## Smoke tests de backend

Función: `runPhase1SmokeTests()`.

Prueba actualmente:

1. existencia del Spreadsheet de plataforma;
2. existencia de al menos dos tenants demo;
3. almacenamiento separado por tenant;
4. ausencia del usuario de Iron Factory en Ocean Fit;
5. cajero sin permiso `user.read`;
6. propietario con permiso `audit.read`.

## Pruebas manuales frontend

### Modo estático

- abrir `index.html`;
- cambiar tema;
- abrir `login.html`;
- ingresar con perfiles demo;
- navegar al dashboard;
- verificar responsive móvil;
- cerrar sesión.

### Modo Apps Script

- configurar endpoint;
- iniciar como `admin@gymflow.demo`;
- comprobar creación de fila en `Sessions`;
- comprobar que el token claro no aparece en Sheets;
- comprobar evento de login en `AuditLogs`;
- comprobar que el dashboard recupera KPI del snapshot;
- cerrar sesión;
- comprobar `status=REVOKED`;
- intentar reutilizar token revocado y esperar `UNAUTHENTICATED`.

### Aislamiento

Con sesión Iron Factory, ninguna acción de tenant debe permitir consultar Ocean Fit enviando manualmente `tenantId=tenant_demo_ocean_fit` en `payload`. El servidor debe ignorarlo y resolver el contexto desde sesión.

## Pendientes antes de datos reales

- pruebas automáticas de CRUD;
- pruebas de concurrencia;
- rate limiting;
- sesión de producción con IdP;
- pruebas de acceso cruzado por todos los endpoints;
- restauración de backup;
- pruebas de suspensión de tenant.
