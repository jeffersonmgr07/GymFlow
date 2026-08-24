# Manual acumulativo — Propietario / Administrador

## Fase 1 v0.3.0

### Sedes

Permite crear, editar, suspender y reactivar sedes según el límite del plan SaaS.

### Usuarios

Permite crear usuarios, definir sede primaria, asignar uno o varios roles, suspender/reactivar y preparar vinculación con Firebase.

No se crean ni almacenan contraseñas en Google Sheets.

### Roles y permisos

El administrador puede consultar la matriz base. La edición global corresponde al Super Admin SaaS.

### Configuración

Permite guardar:

- nombre de marca;
- eslogan;
- URLs de logos/favicon;
- tema;
- colores personalizados;
- moneda;
- locale;
- zona horaria.

### Selector de sede

El propietario puede cambiar la sede activa desde el encabezado. La sesión actualiza su `branchId` y las pantallas siguientes utilizan ese contexto.

### Auditoría

Muestra eventos críticos con fecha, acción, usuario, entidad, resultado y detalle JSON.
