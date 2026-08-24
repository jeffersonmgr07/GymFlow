# Changelog — GymFlow OS

## 0.2.0 — 2026-08-23

### Añadido

- cliente API configurable;
- backend Apps Script por capas;
- contrato API 0.2.0;
- setup idempotente;
- Spreadsheet maestro de plataforma;
- Spreadsheet separado por tenant;
- roles y permisos base;
- sesiones opacas con hash, expiración y revocación;
- RBAC en backend;
- `TenantService`, `BranchService`, `UserService`, `SessionService`, `AuditService`, `DashboardService`;
- Super Admin SaaS inicial;
- dos gimnasios demo;
- smoke tests de aislamiento;
- documentación de arquitectura, datos, seguridad, despliegue y pruebas;
- notas de manuales y capacitación.

### Modificado

- login preparado para backend demo opcional;
- dashboard puede cargar tenant, sede y KPI desde API;
- `demo-data.js` incorpora Super Admin;
- `.gitignore` protege configuración local de clasp.

### Seguridad

- no se añadió autenticación propia por contraseña;
- el login backend demo queda desactivable por Script Property;
- el backend ignora cualquier tenant operativo libre enviado por el frontend.

## 0.1.0 — 2026-08-23

- sitio público;
- login visual demo;
- dashboard administrativo demo;
- motor de temas;
- responsive;
- documentación inicial.
