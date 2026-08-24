const GF_UserService = Object.freeze({
  getByIdForTenant: function (tenantId, userId) {
    const row = GF_Repository.findOne(GF_Repository.getTenantSpreadsheet(tenantId), GF_TENANT_SHEETS.USERS, {
      tenant_id: tenantId,
      user_id: userId
    });
    if (!row) return null;
    return this.toPublic(row);
  },

  rolesForUser: function (tenantId, userId) {
    return GF_Repository.findMany(GF_Repository.getTenantSpreadsheet(tenantId), GF_TENANT_SHEETS.USER_ROLES, {
      tenant_id: tenantId,
      user_id: userId,
      status: 'ACTIVE'
    }).map(function (row) { return row.role_id; });
  },

  list: function (ctx) {
    GF_RbacService.require(ctx, 'user.read');
    if (!ctx.tenantId) throw GF_Errors.forbidden('Contexto tenant requerido.', 'TENANT_CONTEXT_REQUIRED');
    return GF_Repository.findMany(GF_Repository.getTenantSpreadsheet(ctx.tenantId), GF_TENANT_SHEETS.USERS, { tenant_id: ctx.tenantId })
      .map(this.toPublic);
  },

  toPublic: function (row) {
    return {
      userId: row.user_id,
      tenantId: row.tenant_id,
      branchId: row.branch_id || null,
      email: row.email,
      displayName: row.display_name,
      publicName: row.public_name,
      status: row.status,
      avatarUrl: row.avatar_url || ''
    };
  }
});
