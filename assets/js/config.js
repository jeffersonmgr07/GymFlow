/**
 * GymFlow OS — configuración pública del frontend.
 * No colocar secretos aquí. La configuración web de Firebase es pública por diseño;
 * los valores sensibles del backend se guardan en Apps Script > Script Properties.
 */
window.GYMFLOW_CONFIG = Object.freeze({
  API_MODE: 'demo', // 'demo' | 'apps-script'
  API_BASE_URL: '', // https://script.google.com/macros/s/DEPLOYMENT_ID/exec
  ENABLE_BACKEND_DEMO_LOGIN: false,
  REQUEST_TIMEOUT_MS: 15000,
  APP_VERSION: '0.3.0',
  FIREBASE: Object.freeze({
    enabled: false,
    apiKey: '',
    authDomain: '',
    projectId: '',
    appId: ''
  })
});
