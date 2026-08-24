(() => {
  'use strict';
  const config = window.GYMFLOW_CONFIG || {};
  const SESSION_KEY = 'gymflow-api-session';

  function isEnabled() { return config.API_MODE === 'apps-script' && Boolean(config.API_BASE_URL); }
  function getSession() { try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null'); } catch (_) { return null; } }
  function setSession(session) { if (!session) sessionStorage.removeItem(SESSION_KEY); else sessionStorage.setItem(SESSION_KEY, JSON.stringify(session)); }
  function clearSession() { sessionStorage.removeItem(SESSION_KEY); }

  async function request(action, payload = {}, options = {}) {
    if (!isEnabled()) { const error = new Error('API_NOT_CONFIGURED'); error.code = 'API_NOT_CONFIGURED'; throw error; }
    const session = getSession();
    const body = {
      action,
      payload,
      requestId: (window.crypto && typeof window.crypto.randomUUID === 'function' ? window.crypto.randomUUID() : `web_${Date.now()}_${Math.random().toString(36).slice(2)}`),
      client: { appVersion: config.APP_VERSION || '0.0.0', page: document.body?.dataset?.page || 'unknown' }
    };
    if (!options.anonymous && session?.token) body.sessionToken = session.token;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.REQUEST_TIMEOUT_MS || 15000);
    try {
      const response = await fetch(config.API_BASE_URL, {
        method: 'POST', mode: 'cors', credentials: 'omit', cache: 'no-store', redirect: 'follow',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body), signal: controller.signal
      });
      const text = await response.text();
      let json;
      try { json = JSON.parse(text); } catch (_) { const error = new Error('Respuesta inválida del backend.'); error.code = 'INVALID_API_RESPONSE'; throw error; }
      if (!json.ok) {
        const error = new Error(json.message || 'La operación no pudo completarse.');
        error.code = json.errorCode || 'API_ERROR'; error.correlationId = json.correlationId || null;
        if (['SESSION_EXPIRED','UNAUTHENTICATED','SESSION_REVOKED','TENANT_SUSPENDED'].includes(error.code)) clearSession();
        throw error;
      }
      return json;
    } catch (error) {
      if (error.name === 'AbortError') { const timeoutError = new Error('El backend tardó demasiado en responder.'); timeoutError.code = 'REQUEST_TIMEOUT'; throw timeoutError; }
      throw error;
    } finally { clearTimeout(timeout); }
  }

  function persistLoginResponse(response) {
    const session = {
      token: response.data.sessionToken,
      user: response.data.user,
      tenant: response.data.tenant,
      branch: response.data.branch,
      permissions: response.data.permissions || [],
      roleIds: response.data.roleIds || [],
      expiresAt: response.data.expiresAt,
      authMode: response.data.authMode || 'UNKNOWN'
    };
    setSession(session);
    return session;
  }

  async function demoLogin(email) { return persistLoginResponse(await request('auth.demoLogin', { email }, { anonymous: true })); }
  async function firebaseLogin(idToken) { return persistLoginResponse(await request('auth.firebaseLogin', { idToken }, { anonymous: true })); }

  async function switchBranch(branchId) {
    const response = await request('session.branch.switch', { branchId });
    const session = getSession();
    if (session) setSession({ ...session, branch: response.data });
    return response.data;
  }

  async function logout() {
    try { if (getSession()?.token) await request('auth.logout', {}); } finally { clearSession(); }
  }

  window.GymFlowApi = Object.freeze({ isEnabled, getSession, setSession, clearSession, request, demoLogin, firebaseLogin, switchBranch, logout });
})();
