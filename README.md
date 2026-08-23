# GymFlow OS — Fase 1

Prototipo frontend navegable del SaaS multigimnasio definido en el Prompt Maestro Unificado.

## Qué incluye esta entrega

- Sitio público `index.html`.
- Login demostrativo `login.html`.
- Dashboard administrativo `admin/dashboard.html`.
- Motor de temas con 4 variantes iniciales: Iron, Cyber, Red y Ocean.
- Navegación responsive y sidebar móvil.
- Datos ficticios centralizados en `assets/js/demo-data.js`.
- Simulación local de sesión con `localStorage` únicamente para la demo visual.
- Documentación inicial de Fase 1.

## Importante

Esta versión **NO implementa autenticación real ni seguridad de producción**. El formulario de acceso es una simulación de UX para GitHub Pages. No debe usarse con datos reales ni contraseñas reales.

La seguridad real será implementada en backend con sesión, tenant, sede y RBAC antes de operar con información real.

## Probar localmente

Puedes abrir `index.html` directamente o levantar un servidor local:

```bash
python3 -m http.server 8080
```

Luego visita:

```text
http://localhost:8080/
```

## Publicar en GitHub Pages

1. Crea un repositorio, por ejemplo `gymflow-os`.
2. Sube el contenido de esta carpeta a la raíz del repositorio.
3. En GitHub abre **Settings → Pages**.
4. En **Build and deployment**, selecciona **Deploy from a branch**.
5. Selecciona la rama `main` y la carpeta `/ (root)`.
6. Guarda los cambios.

## Estructura actual

```text
gymflow-os/
├── index.html
├── login.html
├── admin/
│   └── dashboard.html
├── assets/
│   ├── css/
│   │   └── styles.css
│   └── js/
│       ├── app.js
│       └── demo-data.js
├── docs/
│   ├── ficha-tecnica.md
│   ├── fase-1.md
│   └── changelog.md
├── .gitignore
└── README.md
```

## Próximo incremento recomendado

1. Definir contrato de API.
2. Crear backend Apps Script por capas.
3. Crear Spreadsheet maestro de plataforma y Spreadsheet por gimnasio.
4. Implementar `TenantService`, `BranchService`, `UserService`, `AuthService` y `AuditService`.
5. Sustituir el login simulado por autenticación real.
6. Aplicar RBAC en backend.
7. Conectar KPIs del dashboard con datos del tenant autenticado.
