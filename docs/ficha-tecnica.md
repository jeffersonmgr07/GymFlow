# Ficha técnica — GymFlow OS

## Identificación

- Producto: GymFlow OS
- Versión: 0.2.0
- Fase: 1 — Núcleo SaaS
- Mercado inicial: Perú y Latinoamérica
- Arquitectura: SaaS multitenant y multisede

## Incremento 0.2.0

La versión 0.1.0 era un prototipo frontend. La 0.2.0 incorpora la primera capa backend real sobre Google Apps Script y Google Sheets, conservando el modo estático para GitHub Pages.

## Frontend

- HTML5
- CSS3
- JavaScript Vanilla
- `config.js` para modo demo/API
- `api-client.js` como adaptador HTTP
- `app.js` para comportamiento y sincronización de UI
- `sessionStorage` para token de sesión API
- `localStorage` solo para preferencias y sesión ficticia del modo estático

## Backend

- Google Apps Script V8
- router por acción;
- respuestas uniformes;
- repositorio genérico;
- RBAC;
- sesión opaca;
- tenant/sede desde sesión;
- auditoría;
- setup idempotente;
- smoke tests.

## Almacenamiento piloto

1 Spreadsheet de plataforma + 1 Spreadsheet por tenant.

Datos demo creados:

- Iron Factory: 2 sedes.
- Ocean Fit Club: 1 sede.
- Super Admin SaaS.
- propietario/administrador;
- gerente;
- recepción/caja.

## Seguridad

El token claro de sesión se entrega al navegador y se conserva en `sessionStorage`; Sheets almacena solo `SHA-256(token)`. Las sesiones expiran y pueden revocarse.

No hay contraseñas reales ni secretos en el repositorio.

## Restricción consciente

`auth.demoLogin` es solo un mecanismo de laboratorio. No debe utilizarse con información real. El cierre de Fase 1 requiere proveedor de identidad externo.
