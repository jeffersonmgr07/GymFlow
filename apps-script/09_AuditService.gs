/** Auditoría append-only desde la capa de servicios. */
const GF_AuditService = Object.freeze({
  record: function (ctx, event) {
    const e = event || {};
    const record = {
      audit_id: GF_Utils.uuid('aud'),
      tenant_id: ctx && ctx.tenantId ? ctx.tenantId : (e.tenantId || ''),
      branch_id: ctx && ctx.branchId ? ctx.branchId : (e.branchId || ''),
      user_id: ctx && ctx.userId ? ctx.userId : (e.userId || ''),
      role_ids_json: JSON.stringify(ctx && ctx.roleIds ? ctx.roleIds : []),
      module: e.module || 'system',
      action: e.action || 'unknown',
      entity: e.entity || '',
      record_id: e.recordId || '',
      occurred_at: GF_Utils.nowIso(),
      before_json: e.before === undefined ? '' : GF_Utils.jsonStringify(e.before),
      after_json: e.after === undefined ? '' : GF_Utils.jsonStringify(e.after),
      result: e.result || 'SUCCESS',
      reason: String(e.reason || '').slice(0, 500),
      correlation_id: e.correlationId || '',
      version: 1
    };

    if (record.tenant_id) {
      GF_Repository.append(GF_Repository.getTenantSpreadsheet(record.tenant_id), GF_TENANT_SHEETS.AUDIT_LOGS, record);
    } else {
      GF_Repository.append(GF_Repository.getPlatformSpreadsheet(), GF_PLATFORM_SHEETS.AUDIT_LOGS, record);
    }
    return record.audit_id;
  },

  list: function (ctx, limit) {
    GF_RbacService.require(ctx, 'audit.read');
    const max = Math.min(Math.max(Number(limit || 25), 1), GF_CONFIG.MAX_PAGE_SIZE);
    const ss = ctx.tenantId ? GF_Repository.getTenantSpreadsheet(ctx.tenantId) : GF_Repository.getPlatformSpreadsheet();
    const sheetName = ctx.tenantId ? GF_TENANT_SHEETS.AUDIT_LOGS : GF_PLATFORM_SHEETS.AUDIT_LOGS;
    return GF_Repository.readAll(ss, sheetName).slice(-max).reverse();
  }
});
