# Firebase Authentication — Integración de Fase 1

## Estado

El código está integrado en v0.3.0 pero desactivado por defecto para no bloquear el desarrollo con el login demo.

## Qué resuelve

- Firebase valida email/contraseña.
- El frontend obtiene un Firebase ID Token.
- Apps Script verifica ese token con Google Identity Toolkit.
- `AuthIdentities` vincula UID Firebase con `userId` GymFlow.
- GymFlow crea su propia sesión opaca para RBAC, tenant y sede.

## Configuración backend

En Apps Script → Project Settings → Script Properties crear:

```text
FIREBASE_AUTH_ENABLED = true
FIREBASE_API_KEY = <Web API Key del proyecto Firebase>
FIREBASE_PROJECT_ID = <Project ID>
PLATFORM_SUPER_ADMIN_EMAIL = <tu email real de Super Admin>
```

Después ejecutar:

```text
syncPlatformSuperAdminFirebaseIdentity
verifyFirebaseConfiguration
```

## Configuración frontend

En `assets/js/config.js`:

```js
FIREBASE: {
  enabled: true,
  apiKey: '...',
  authDomain: 'tu-proyecto.firebaseapp.com',
  projectId: 'tu-proyecto',
  appId: '...'
}
```

La configuración web de Firebase no contiene la contraseña del usuario ni credenciales administrativas.

## Crear usuarios Firebase

Durante el piloto, las cuentas pueden crearse en Firebase Console usando el mismo email registrado en GymFlow. En el primer login, si existe exactamente un `AuthIdentity` pendiente con ese email, GymFlow vincula automáticamente el UID.

Si un mismo email termina perteneciendo a más de un tenant, la vinculación automática se bloquea y deberá evolucionarse a selección explícita de organización.

## Paso a producción

Después de verificar Firebase:

1. Ejecutar `disableGymFlowDemoLogin()`.
2. Cambiar `ENABLE_BACKEND_DEMO_LOGIN` a `false`.
3. Mantener `FIREBASE.enabled=true`.
