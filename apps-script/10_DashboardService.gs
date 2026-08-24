const GF_DashboardService = Object.freeze({
  summary: function (ctx) {
    GF_RbacService.require(ctx, 'dashboard.read');
    if (!ctx.tenantId) throw GF_Errors.forbidden('Contexto tenant requerido.', 'TENANT_CONTEXT_REQUIRED');
    const ss = GF_Repository.getTenantSpreadsheet(ctx.tenantId);
    const filters = { tenant_id: ctx.tenantId };
    if (ctx.branchId) filters.branch_id = ctx.branchId;
    const rows = GF_Repository.findMany(ss, GF_TENANT_SHEETS.DASHBOARD_SNAPSHOT, filters);
    const row = rows.sort(function (a, b) { return String(b.updated_at).localeCompare(String(a.updated_at)); })[0];
    if (!row) throw GF_Errors.notFound('No existe snapshot demo para este contexto.', 'DASHBOARD_SNAPSHOT_NOT_FOUND');
    return {
      activeMembers: Number(row.active_members || 0),
      monthRevenue: GF_Utils.currency(row.month_revenue_cents, row.currency),
      checkinsToday: Number(row.checkins_today || 0),
      expiring7d: Number(row.expiring_7d || 0),
      debt: GF_Utils.currency(row.debt_cents, row.currency),
      snapshotDate: row.snapshot_date,
      updatedAt: row.updated_at,
      source: 'PHASE1_DEMO_SNAPSHOT'
    };
  }
});
