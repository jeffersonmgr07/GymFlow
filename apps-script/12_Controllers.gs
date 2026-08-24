const GF_Controllers = Object.freeze({
  health: function () {
    return {
      name: GF_CONFIG.APP_NAME,
      apiVersion: GF_CONFIG.API_VERSION,
      status: 'ok',
      time: GF_Utils.nowIso(),
      demoMode: GF_AuthService.isDemoMode(),
      firebaseEnabled: GF_FirebaseAuthService.isEnabled()
    };
  },

  dispatchAuthenticated: function (action, ctx, payload, envelope, requestMeta) {
    switch (action) {
      case 'auth.me': return GF_AuthService.me(ctx);
      case 'auth.logout': return GF_AuthService.logout(envelope.sessionToken, ctx, requestMeta.correlationId);
      case 'session.branch.switch': return GF_SessionService.switchBranch(envelope.sessionToken, ctx, payload && payload.branchId);

      case 'tenant.current': return GF_TenantService.current(ctx);
      case 'tenant.settings.get': return GF_SettingsService.get(ctx);
      case 'tenant.settings.update': return GF_SettingsService.update(ctx, payload && payload.key, payload && payload.value, requestMeta);

      case 'platform.tenants.list': return GF_TenantService.listPlatform(ctx);
      case 'platform.tenants.get': return GF_TenantService.getPlatform(ctx, payload && payload.tenantId);
      case 'platform.tenants.create': return GF_TenantService.createPlatform(ctx, payload, requestMeta);
      case 'platform.tenants.update': return GF_TenantService.updatePlatform(ctx, payload && payload.tenantId, payload, requestMeta);
      case 'platform.tenants.status': return GF_TenantService.setStatusPlatform(ctx, payload && payload.tenantId, payload && payload.status, payload && payload.reason, requestMeta);

      case 'branches.list': return GF_BranchService.list(ctx, Boolean(payload && payload.includeInactive));
      case 'branches.create': return GF_BranchService.create(ctx, payload, requestMeta);
      case 'branches.update': return GF_BranchService.update(ctx, payload && payload.branchId, payload, requestMeta);
      case 'branches.status': return GF_BranchService.setStatus(ctx, payload && payload.branchId, payload && payload.status, requestMeta);

      case 'users.list': return GF_UserService.list(ctx, Boolean(payload && payload.includeInactive));
      case 'users.create': return GF_UserService.create(ctx, payload, requestMeta);
      case 'users.update': return GF_UserService.update(ctx, payload && payload.userId, payload, requestMeta);
      case 'users.status': return GF_UserService.setStatus(ctx, payload && payload.userId, payload && payload.status, requestMeta);
      case 'users.roles.set': return GF_UserService.setRoles(ctx, payload && payload.userId, payload && payload.roleIds, requestMeta);

      case 'roles.list': return GF_RoleService.list(ctx);
      case 'permissions.matrix': return GF_RoleService.matrix(ctx);
      case 'platform.permissions.matrix.update': return GF_RoleService.updateMatrix(ctx, payload && payload.roleId, payload && payload.permissionCodes, requestMeta);

      case 'dashboard.summary': return GF_DashboardService.summary(ctx);
      case 'audit.list': return GF_AuditService.list(ctx, payload && payload.limit);
      default: throw GF_Errors.notFound('Acción API no encontrada: ' + action, 'ACTION_NOT_FOUND');
    }
  }
});
