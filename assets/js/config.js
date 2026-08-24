/**
 * GymFlow OS — configuración pública del frontend.
 *
 * IMPORTANTE:
 * - Este archivo puede versionarse en GitHub porque NO debe contener secretos.
 * - La URL de un Web App de Apps Script es un endpoint público, no una credencial.
 * - API_MODE="demo" mantiene el prototipo 100% estático.
 * - API_MODE="apps-script" activa el cliente HTTP hacia el backend.
 */
window.GYMFLOW_CONFIG = Object.freeze({
  API_MODE: 'demo', // 'demo' | 'apps-script'
  API_BASE_URL: '', // Ej.: https://script.google.com/macros/s/DEPLOYMENT_ID/exec
  ENABLE_BACKEND_DEMO_LOGIN: false,
  REQUEST_TIMEOUT_MS: 12000,
  APP_VERSION: '0.2.0'
});
