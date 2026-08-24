/** Sesiones opacas, expirables y revocables. Se guarda únicamente el hash del token. */
const GF_SessionService = Object.freeze({
  create: function (identity, roleIds, correlationId, clientLabel) {
    const ss = GF_Repository.getPlatformSpreadsheet();
    const now = GF_Utils.nowIso();
    const expiresAt = GF_Utils.addHoursIso(now, GF_CONFIG.SESSION_TTL_HOURS);
    const token = GF_Utils.randomToken();
    const record = {
      session_id: GF_Utils.uuid('ses'),
      token_hash: GF_Utils.sha256Hex(token),
      user_id: identity.user_id,
      tenant_id: identity.tenant_id || '',
      branch_id: identity.branch_id || '',
      role_ids_json: JSON.stringify(roleIds || []),
      created_at: now,
      expires_at: expiresAt,
      revoked_at: '',
      status: 'ACTIVE',
      client_label: GF_Utils.sanitizeClientLabel(clientLabel),
      correlation_id: correlationId || '',
      version: 1
    };
    GF_Repository.append(ss, GF_PLATFORM_SHEETS.SESSIONS, record);
    return { token: token, expiresAt: expiresAt, sessionId: record.session_id };
  },

  resolve: function (token) {
    if (!token) throw GF_Errors.unauthenticated('Sesión requerida.', 'UNAUTHENTICATED');
    const hash = GF_Utils.sha256Hex(token);
    const cache = CacheService.getScriptCache();
    const cacheKey = 'session:' + hash.slice(0, 40);
    const cached = cache.get(cacheKey);
    if (cached) {
      const ctx = GF_Utils.safeJsonParse(cached, null);
      if (ctx && new Date(ctx.expiresAt).getTime() > Date.now()) return ctx;
      cache.remove(cacheKey);
    }

    const ss = GF_Repository.getPlatformSpreadsheet();
    const row = GF_Repository.findOne(ss, GF_PLATFORM_SHEETS.SESSIONS, { token_hash: hash, status: 'ACTIVE' });
    if (!row) throw GF_Errors.unauthenticated('Sesión inválida o revocada.', 'UNAUTHENTICATED');
    if (row.revoked_at) throw GF_Errors.unauthenticated('La sesión fue revocada.', 'SESSION_REVOKED');
    if (new Date(row.expires_at).getTime() <= Date.now()) {
      GF_Repository.updateByField(ss, GF_PLATFORM_SHEETS.SESSIONS, 'session_id', row.session_id, { status: 'EXPIRED' });
      throw GF_Errors.unauthenticated('La sesión expiró.', 'SESSION_EXPIRED');
    }

    const roleIds = GF_Utils.safeJsonParse(row.role_ids_json, []);
    const ctx = {
      sessionId: row.session_id,
      userId: row.user_id,
      tenantId: row.tenant_id || null,
      branchId: row.branch_id || null,
      roleIds: roleIds,
      permissions: GF_RbacService.permissionsForRoles(roleIds),
      expiresAt: new Date(row.expires_at).toISOString()
    };
    cache.put(cacheKey, JSON.stringify(ctx), GF_CONFIG.CACHE_TTL_SECONDS);
    return ctx;
  },

  revoke: function (token) {
    if (!token) return false;
    const hash = GF_Utils.sha256Hex(token);
    const ss = GF_Repository.getPlatformSpreadsheet();
    const row = GF_Repository.findOne(ss, GF_PLATFORM_SHEETS.SESSIONS, { token_hash: hash });
    if (!row) return false;
    GF_Repository.updateByField(ss, GF_PLATFORM_SHEETS.SESSIONS, 'session_id', row.session_id, {
      status: 'REVOKED',
      revoked_at: GF_Utils.nowIso()
    });
    CacheService.getScriptCache().remove('session:' + hash.slice(0, 40));
    return true;
  }
});
