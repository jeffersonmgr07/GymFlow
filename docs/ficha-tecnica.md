# Ficha técnica — GymFlow OS

## Identificación

- Producto: GymFlow OS (nombre provisional)
- Versión de esta entrega: 0.1.0
- Fase: 1 — Núcleo SaaS, prototipo frontend
- Mercado inicial: Perú y Latinoamérica
- Arquitectura objetivo: SaaS multitenant y multisede

## Objetivo de la versión 0.1.0

Construir una base visual y estructural que permita validar identidad, navegación, responsive, dashboard administrativo y motor de temas antes de conectar persistencia y autenticación real.

## Stack actual

- HTML5
- CSS3
- JavaScript Vanilla
- LocalStorage exclusivamente para preferencias y sesión ficticia de demostración
- GitHub Pages / Cloudflare Pages como hosting estático compatible

## Archivos principales

- `index.html`: sitio público y presentación del producto.
- `login.html`: experiencia de acceso demo.
- `admin/dashboard.html`: dashboard administrativo demo.
- `assets/css/styles.css`: design tokens, componentes y responsive.
- `assets/js/demo-data.js`: datos completamente ficticios.
- `assets/js/app.js`: temas, navegación, simulación de login, sidebar y render de accesos.

## Design tokens

La UI usa variables CSS para cumplir con la estrategia de marca blanca:

- `--color-primary`
- `--color-secondary`
- `--color-accent`
- `--color-background`
- `--color-surface`
- `--color-surface-2`
- `--color-text`
- `--color-muted`
- `--color-border`
- `--color-success`
- `--color-warning`
- `--color-danger`
- `--font-heading`
- `--font-body`
- `--radius`
- `--shadow`
- `--density`

## Temas implementados en demo

1. Iron Yellow — predeterminado.
2. Neon Cyber.
3. Red Power.
4. Ocean Pulse.

Pendientes: Aura Pink y Minimal Stone.

## Seguridad

Esta entrega no contiene backend. Por lo tanto:

- no existe autenticación real;
- no existe autorización real;
- no existe aislamiento real de tenant;
- no existen secretos;
- no se persisten datos de negocio;
- no debe usarse con información real.

`localStorage` se utiliza únicamente para demostrar la experiencia visual de una sesión.

## Arquitectura objetivo siguiente

```text
Frontend estático
  ↓ HTTPS
Apps Script Web App / API
  ↓
Controllers
  ↓
Domain Services
  ↓
Repositories
  ↓
Spreadsheet maestro + Spreadsheet por tenant
```

## Decisión técnica

No se incorporó framework frontend en esta fase. El objetivo es mantener una base liviana, fácil de desplegar y compatible con la especificación que prioriza HTML, CSS y JavaScript Vanilla.
