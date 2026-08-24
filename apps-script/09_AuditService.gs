/** Auditoría append-only desde la capa de servicios. */
const GF_AuditService = Object.freeze({
  buildRecord_: function (ctx, event) {
    const e = event || {};
    return {
      audit_id: GF_Utils.uuid('aud'),
      tenant_id: e.forcePlatform ? '' : (ctx && ctx.tenantId ? ctx.tenantId : (e.tenantId || '')),
      branch_id: e.forcePlatform ? '' : (ctx && ctx.branchId ? ctx.branchId : (e.branchId || '')),
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
  },

  record: function (ctx, event) {
    const record = this.buildRecord_(ctx, event);
    if (record.tenant_id) GF_Repository.append(GF_Repository.getTenantSpreadsheetAnyStatus(record.tenant_id), GF_TENANT_SHEETS.AUDIT_LOGS, record);
    else GF_Repository.append(GF_Repository.getPlatformSpreadsheet(), GF_PLATFORM_SHEETS.AUDIT_LOGS, record);
    return record.audit_id;
  },

  recordPlatform: function (ctx, event) {
    const e = Object.assign({}, event || {}, { forcePlatform:true });
    return this.record(ctx, e);
  },

  list: function (ctx, limit) {
    if (ctx.tenantId) GF_RbacService.require(ctx, 'audit.read');
    else GF_RbacService.require(ctx, 'platform.audit.read');
    const max = Math.min(Math.max(Number(limit || 50), 1), GF_CONFIG.MAX_PAGE_SIZE);
    const ss = ctx.tenantId ? GF_Repository.getTenantSpreadsheet(ctx.tenantId) : GF_Repository.getPlatformSpreadsheet();
    const sheetName = ctx.tenantId ? GF_TENANT_SHEETS.AUDIT_LOGS : GF_PLATFORM_SHEETS.AUDIT_LOGS;
    return GF_Repository.readAll(ss, sheetName).slice(-max).reverse().map(function (row) {
      return {
        auditId:row.audit_id, tenantId:row.tenant_id || null, branchId:row.branch_id || null, userId:row.user_id || null,
        roleIds:GF_Utils.safeJsonParse(row.role_ids_json,[]), module:row.module, action:row.action, entity:row.entity, recordId:row.record_id,
        occurredAt:row.occurred_at, before:GF_Utils.safeJsonParse(row.before_json,null), after:GF_Utils.safeJsonParse(row.after_json,null), result:row.result,
        reason:row.reason || '', correlationId:row.correlation_id || ''
      };
    });
  }
});
