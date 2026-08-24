/**
 * Verificación de Firebase Authentication mediante Identity Toolkit accounts:lookup.
 * La API key se guarda en Script Properties, nunca en archivos .gs.
 */
const GF_FirebaseAuthService = Object.freeze({
  isEnabled: function () {
    return GF_Utils.asBoolean(PropertiesService.getScriptProperties().getProperty(GF_CONFIG.FIREBASE_ENABLED_PROP));
  },

  verifyIdToken: function (idToken) {
    if (!this.isEnabled()) throw GF_Errors.forbidden('Firebase Authentication todavía no está habilitado en el backend.', 'FIREBASE_AUTH_DISABLED');
    const props = PropertiesService.getScriptProperties();
    const apiKey = props.getProperty(GF_CONFIG.FIREBASE_API_KEY_PROP);
    const projectId = props.getProperty(GF_CONFIG.FIREBASE_PROJECT_ID_PROP);
    if (!apiKey || !projectId) throw GF_Errors.conflict('Falta configuración Firebase en Script Properties.', 'FIREBASE_CONFIG_MISSING');
    const token = GF_Utils.requireString(idToken, 'idToken');
    const response = UrlFetchApp.fetch('https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' + encodeURIComponent(apiKey), {
      method:'post', contentType:'application/json', muteHttpExceptions:true, payload:JSON.stringify({ idToken:token })
    });
    if (response.getResponseCode() !== 200) throw GF_Errors.unauthenticated('Token Firebase inválido o expirado.', 'FIREBASE_TOKEN_INVALID');
    const body = GF_Utils.safeJsonParse(response.getContentText(), {});
    const user = body.users && body.users[0];
    if (!user || !user.localId) throw GF_Errors.unauthenticated('No se pudo resolver el usuario Firebase.', 'FIREBASE_USER_NOT_FOUND');
    if (user.email && user.emailVerified === false) throw GF_Errors.unauthenticated('Debes verificar tu correo antes de ingresar.', 'EMAIL_NOT_VERIFIED');
    return user;
  }
});
