const GF_Router = Object.freeze({
  handle: function (envelope, e) {
    const correlationId = String(envelope && envelope.requestId || GF_Utils.uuid('corr')).slice(0, 120);
    const action = String(envelope && envelope.action || '').trim();
    const payload = envelope && envelope.payload ? envelope.payload : {};
    const requestMeta = {
      correlationId: correlationId,
      clientLabel: GF_Utils.sanitizeClientLabel(envelope && envelope.client ? GF_Utils.jsonStringify(envelope.client) : '')
    };

    try {
      if (!action) throw GF_Errors.badRequest('Debes indicar action.', 'ACTION_REQUIRED');
      if (action === 'system.health') return GF_Response.success(GF_Controllers.health(), 'API disponible.', correlationId);
      if (action === 'auth.demoLogin') return GF_Response.success(GF_AuthService.demoLogin(payload, requestMeta), 'Sesión demo iniciada.', correlationId);
      if (action === 'auth.firebaseLogin') return GF_Response.success(GF_AuthService.firebaseLogin(payload, requestMeta), 'Sesión Firebase iniciada.', correlationId);

      const ctx = GF_SessionService.resolve(envelope.sessionToken);
      const data = GF_Controllers.dispatchAuthenticated(action, ctx, payload, envelope, requestMeta);
      return GF_Response.success(data, 'Operación completada.', correlationId);
    } catch (error) {
      console.error(JSON.stringify({ correlationId:correlationId, action:action, errorName:error && error.name, errorCode:error && error.code, message:error && error.message }));
      return GF_Response.failure(error, correlationId);
    }
  }
});
