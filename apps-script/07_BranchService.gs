const GF_BranchService = Object.freeze({
  list: function (ctx) {
    GF_RbacService.require(ctx, 'branch.read');
    if (!ctx.tenantId) throw GF_Errors.forbidden('Contexto tenant requerido.', 'TENANT_CONTEXT_REQUIRED');
    return GF_Repository.findMany(GF_Repository.getTenantSpreadsheet(ctx.tenantId), GF_TENANT_SHEETS.BRANCHES, {
      tenant_id: ctx.tenantId,
      status: 'ACTIVE'
    }).map(function (row) {
      return { branchId: row.branch_id, name: row.name, code: row.code, status: row.status, timezone: row.timezone, addressText: row.address_text };
    });
  },

  current: function (ctx) {
    if (!ctx.branchId) return null;
    const branches = this.list(ctx);
    return branches.find(function (branch) { return branch.branchId === ctx.branchId; }) || null;
  }
});
