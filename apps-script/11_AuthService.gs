/** Autenticación demo para desarrollo + intercambio de identidad Firebase para producción. */
const GF_AuthService = Object.freeze({
  isDemoMode: function () {
    return GF_Utils.asBoolean(PropertiesService.getScriptProperties().getProperty(GF_CONFIG.DEMO_MODE_PROP));
  },

  demoLogin: function (payload, requestMeta) {
    if (!this.isDemoMode()) throw GF_Errors.forbidden('El acceso demo está deshabilitado.', 'DEMO_LOGIN_DISABLED');
    const email = GF_Utils.normalizeEmail(GF_Utils.requireString(payload && payload.email, 'email'));
    const platform = GF_Repository.getPlatformSpreadsheet();
    const identity = GF_Repository.findOne(platform, GF_PLATFORM_SHEETS.DEMO_IDENTITIES, { email:email, status:'ACTIVE' });
    if (!identity) throw GF_Errors.unauthenticated('Perfil demo no encontrado.', 'DEMO_IDENTITY_NOT_FOUND');
    return this.createSessionFromIdentity_(identity, requestMeta, 'DEMO_BACKEND_ONLY');
  },

  firebaseLogin: function (payload, requestMeta) {
    const firebaseUser = GF_FirebaseAuthService.verifyIdToken(payload && payload.idToken);
    const identity = GF_IdentityService.resolveFirebaseIdentity_(firebaseUser);
    const result = this.createSessionFromIdentity_(identity, requestMeta, 'FIREBASE');
    if (identity.tenant_id) {
      const ss = GF_Repository.getTenantSpreadsheet(identity.tenant_id);
      const user = GF_Repository.findOne(ss, GF_TENANT_SHEETS.USERS, { user_id:identity.user_id });
      if (user) GF_Repository.updateByField(ss, GF_TENANT_SHEETS.USERS, 'user_id', identity.user_id, { auth_provider:'firebase', auth_uid:firebaseUser.localId, last_login_at:GF_Utils.nowIso(), updated_at:GF_Utils.nowIso(), version:Number(user.version || 1)+1 });
    }
    return result;
  },

  createSessionFromIdentity_: function (identity, requestMeta, authMode) {
    const platform = GF_Repository.getPlatformSpreadsheet();
    let user;
    let roleIds;
    let tenant = null;
    let branch = null;
    if (!identity.tenant_id) {
      user = { userId:identity.user_id, email:identity.email, displayName:'Super Admin SaaS', status:'ACTIVE' };
      roleIds = ['role_platform_super_admin'];
    } else {
      const tenantRow = GF_Repository.findOne(platform, GF_PLATFORM_SHEETS.TENANTS, { tenant_id:identity.tenant_id });
      if (!tenantRow || tenantRow.status !== 'ACTIVE') throw GF_Errors.forbidden('El gimnasio no está activo.', 'TENANT_SUSPENDED');
      user = GF_UserService.getByIdForTenant(identity.tenant_id, identity.user_id);
      if (!user || user.status !== 'ACTIVE') throw GF_Errors.unauthenticated('Usuario no disponible.', 'USER_NOT_ACTIVE');
      roleIds = GF_UserService.rolesForUser(identity.tenant_id, identity.user_id);
      if (!roleIds.length) throw GF_Errors.forbidden('Usuario sin roles activos.', 'USER_WITHOUT_ROLE');
      tenant = GF_TenantService.toPublic(tenantRow);
      const branchRow = GF_Repository.findOne(GF_Repository.getTenantSpreadsheet(identity.tenant_id), GF_TENANT_SHEETS.BRANCHES, { branch_id:identity.branch_id });
      branch = branchRow ? GF_BranchService.toPublic(branchRow) : null;
    }

    const session = GF_SessionService.create(identity, roleIds, requestMeta.correlationId, requestMeta.clientLabel);
    const permissions = GF_RbacService.permissionsForRoles(roleIds);
    const ctx = { userId:identity.user_id, tenantId:identity.tenant_id || null, branchId:identity.branch_id || null, roleIds:roleIds, permissions:permissions };
    GF_AuditService.record(ctx, { module:'auth', action:authMode === 'FIREBASE' ? 'firebase_login' : 'demo_login', entity:'Session', recordId:session.sessionId, correlationId:requestMeta.correlationId });
    return { sessionToken:session.token, expiresAt:session.expiresAt, user:user, tenant:tenant, branch:branch, roleIds:roleIds, permissions:permissions, authMode:authMode };
  },

  me: function (ctx) {
    if (!ctx) throw GF_Errors.unauthenticated();
    if (!ctx.tenantId) return { user:{ userId:ctx.userId, displayName:'Super Admin SaaS' }, tenant:null, branch:null, roleIds:ctx.roleIds, permissions:ctx.permissions, expiresAt:ctx.expiresAt };
    return { user:GF_UserService.getByIdForTenant(ctx.tenantId,ctx.userId), tenant:GF_TenantService.current(ctx), branch:GF_BranchService.current(ctx), roleIds:ctx.roleIds, permissions:ctx.permissions, expiresAt:ctx.expiresAt };
  },

  logout: function (token, ctx, correlationId) {
    const revoked = GF_SessionService.revoke(token);
    GF_AuditService.record(ctx, { module:'auth', action:'logout', entity:'Session', recordId:ctx && ctx.sessionId, correlationId:correlationId });
    return { revoked:revoked };
  }
});
