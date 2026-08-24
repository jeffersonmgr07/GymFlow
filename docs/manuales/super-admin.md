# Manual acumulativo — Super Admin SaaS

## Fase 1 v0.3.0

El Super Admin puede:

- ver gimnasios registrados;
- crear un gimnasio con sede principal y propietario inicial;
- editar metadatos del tenant;
- suspender/reactivar un gimnasio;
- revisar y editar la matriz base de permisos;
- consultar auditoría técnica de plataforma.

### Crear gimnasio

1. Abrir **Gimnasios**.
2. Seleccionar **Nuevo gimnasio**.
3. Completar nombre, plan SaaS, límites, tema y propietario inicial.
4. Guardar.

El sistema crea automáticamente un Spreadsheet aislado para el tenant, una sede principal, el propietario y una identidad Firebase pendiente.

### Suspender gimnasio

La suspensión no elimina datos. Revoca sesiones activas y bloquea el acceso operativo hasta su reactivación.
