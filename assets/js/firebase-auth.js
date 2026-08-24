(() => {
  'use strict';
  const config = window.GYMFLOW_CONFIG?.FIREBASE || {};
  let sdkPromise = null;
  let authInstance = null;

  function isEnabled() {
    return Boolean(config.enabled && config.apiKey && config.authDomain && config.projectId);
  }

  async function loadSdk() {
    if (!isEnabled()) throw new Error('Firebase Authentication no está configurado en el frontend.');
    if (!sdkPromise) {
      sdkPromise = Promise.all([
        import('https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js'),
        import('https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js')
      ]);
    }
    const [appSdk, authSdk] = await sdkPromise;
    if (!authInstance) {
      const app = appSdk.initializeApp({ apiKey:config.apiKey, authDomain:config.authDomain, projectId:config.projectId, appId:config.appId || undefined });
      authInstance = authSdk.getAuth(app);
    }
    return { authSdk, auth:authInstance };
  }

  async function signIn(email, password) {
    const { authSdk, auth } = await loadSdk();
    const credential = await authSdk.signInWithEmailAndPassword(auth, email, password);
    const idToken = await credential.user.getIdToken(true);
    return { idToken, email: credential.user.email, uid: credential.user.uid };
  }

  async function signOut() {
    if (!authInstance) return;
    const { authSdk, auth } = await loadSdk();
    await authSdk.signOut(auth);
  }

  window.GymFlowFirebaseAuth = Object.freeze({ isEnabled, signIn, signOut });
})();
