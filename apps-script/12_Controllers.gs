const GF_Controllers = Object.freeze({
  health: function () {
    return { name: GF_CONFIG.APP_NAME, apiVersion: GF_CONFIG.API_VERSION, status: 'ok', time: GF_Utils.nowIso(), demoMode: GF_AuthService.isDemoMode() };
  },

  dispatchAuthenticated: function (action, ctx, payload, envelope, requestMeta) {
    switch (action) {
      case 'auth.me': return GF_AuthService.me(ctx);
      case 'auth.logout': return GF_AuthService.logout(envelope.sessionToken, ctx, requestMeta.correlationId);
      case 'tenant.current': return GF_TenantService.current(ctx);
      case 'platform.tenants.list': return GF_TenantService.listPlatform(ctx);
      case 'branches.list': return GF_BranchService.list(ctx);
      case 'users.list': return GF_UserService.list(ctx);
      case 'dashboard.summary': return GF_DashboardService.summary(ctx);
      case 'audit.list': return GF_AuditService.list(ctx, payload && payload.limit);
      default: throw GF_Errors.notFound('Acción API no encontrada: ' + action, 'ACTION_NOT_FOUND');
    }
  }
});
