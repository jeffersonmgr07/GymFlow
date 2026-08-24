/**
 * Fase 1: login de backend SOLO para datos demo.
 * Producción deberá intercambiar/verificar un token de un proveedor de identidad.
 */
const GF_AuthService = Object.freeze({
  isDemoMode: function () {
    return GF_Utils.asBoolean(PropertiesService.getScriptProperties().getProperty(GF_CONFIG.DEMO_MODE_PROP));
  },

  demoLogin: function (payload, requestMeta) {
    if (!this.isDemoMode()) throw GF_Errors.forbidden('El acceso demo está deshabilitado.', 'DEMO_LOGIN_DISABLED');
    const email = GF_Utils.normalizeEmail(GF_Utils.requireString(payload && payload.email, 'email'));
    const platform = GF_Repository.getPlatformSpreadsheet();
    const identity = GF_Repository.findOne(platform, GF_PLATFORM_SHEETS.DEMO_IDENTITIES, { email: email, status: 'ACTIVE' });
    if (!identity) throw GF_Errors.unauthenticated('Perfil demo no encontrado.', 'DEMO_IDENTITY_NOT_FOUND');

    // Super Admin es una identidad de plataforma sin tenant.
    let user;
    let roleIds;
    let tenant = null;
    let branch = null;
    if (!identity.tenant_id) {
      user = { userId: identity.user_id, email: identity.email, displayName: 'Super Admin SaaS', status: 'ACTIVE' };
      roleIds = ['role_platform_super_admin'];
    } else {
      user = GF_UserService.getByIdForTenant(identity.tenant_id, identity.user_id);
      if (!user || user.status !== 'ACTIVE') throw GF_Errors.unauthenticated('Usuario demo no disponible.', 'USER_NOT_ACTIVE');
      roleIds = GF_UserService.rolesForUser(identity.tenant_id, identity.user_id);
      tenant = GF_TenantService.toPublic(GF_Repository.findOne(platform, GF_PLATFORM_SHEETS.TENANTS, { tenant_id: identity.tenant_id }));
      branch = GF_Repository.findOne(GF_Repository.getTenantSpreadsheet(identity.tenant_id), GF_TENANT_SHEETS.BRANCHES, { branch_id: identity.branch_id });
      branch = branch ? { branchId: branch.branch_id, name: branch.name, code: branch.code, status: branch.status } : null;
    }

    const session = GF_SessionService.create(identity, roleIds, requestMeta.correlationId, requestMeta.clientLabel);
    const permissions = GF_RbacService.permissionsForRoles(roleIds);
    const ctx = { userId: identity.user_id, tenantId: identity.tenant_id || null, branchId: identity.branch_id || null, roleIds: roleIds, permissions: permissions };
    GF_AuditService.record(ctx, { module: 'auth', action: 'demo_login', entity: 'Session', recordId: session.sessionId, correlationId: requestMeta.correlationId });

    return {
      sessionToken: session.token,
      expiresAt: session.expiresAt,
      user: user,
      tenant: tenant,
      branch: branch,
      roleIds: roleIds,
      permissions: permissions,
      authMode: 'DEMO_BACKEND_ONLY'
    };
  },

  me: function (ctx) {
    if (!ctx) throw GF_Errors.unauthenticated();
    if (!ctx.tenantId) {
      return { user: { userId: ctx.userId, displayName: 'Super Admin SaaS' }, tenant: null, branch: null, roleIds: ctx.roleIds, permissions: ctx.permissions, expiresAt: ctx.expiresAt };
    }
    return {
      user: GF_UserService.getByIdForTenant(ctx.tenantId, ctx.userId),
      tenant: GF_TenantService.current(ctx),
      branch: GF_BranchService.current(ctx),
      roleIds: ctx.roleIds,
      permissions: ctx.permissions,
      expiresAt: ctx.expiresAt
    };
  },

  logout: function (token, ctx, correlationId) {
    const revoked = GF_SessionService.revoke(token);
    GF_AuditService.record(ctx, { module: 'auth', action: 'logout', entity: 'Session', recordId: ctx && ctx.sessionId, correlationId: correlationId });
    return { revoked: revoked };
  }
});
