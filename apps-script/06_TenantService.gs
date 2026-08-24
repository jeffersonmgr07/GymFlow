const GF_TenantService = Object.freeze({
  current: function (ctx) {
    GF_RbacService.require(ctx, 'tenant.read');
    if (!ctx.tenantId) throw GF_Errors.forbidden('Esta sesión no tiene un gimnasio asignado.', 'TENANT_CONTEXT_REQUIRED');
    const tenant = GF_Repository.findOne(GF_Repository.getPlatformSpreadsheet(), GF_PLATFORM_SHEETS.TENANTS, { tenant_id: ctx.tenantId });
    if (!tenant) throw GF_Errors.notFound('Gimnasio no encontrado.', 'TENANT_NOT_FOUND');
    return this.toPublic(tenant);
  },

  listPlatform: function (ctx) {
    GF_RbacService.require(ctx, 'platform.tenants.read');
    return GF_Repository.readAll(GF_Repository.getPlatformSpreadsheet(), GF_PLATFORM_SHEETS.TENANTS).map(this.toPublic);
  },

  toPublic: function (tenant) {
    return {
      tenantId: tenant.tenant_id,
      name: tenant.name,
      slug: tenant.slug,
      status: tenant.status,
      themeKey: tenant.theme_key,
      currency: tenant.currency,
      locale: tenant.locale,
      timezone: tenant.timezone
    };
  }
});
