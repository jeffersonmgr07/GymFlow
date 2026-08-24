const GF_BranchService = Object.freeze({
  list: function (ctx, includeInactive) {
    GF_RbacService.require(ctx, 'branch.read');
    if (!ctx.tenantId) throw GF_Errors.forbidden('Contexto tenant requerido.', 'TENANT_CONTEXT_REQUIRED');
    const rows = GF_Repository.findMany(GF_Repository.getTenantSpreadsheet(ctx.tenantId), GF_TENANT_SHEETS.BRANCHES, { tenant_id: ctx.tenantId });
    return rows.filter(function (row) { return includeInactive || row.status === 'ACTIVE'; }).map(this.toPublic);
  },

  getById: function (tenantId, branchId, anyStatus) {
    const ss = anyStatus ? GF_Repository.getTenantSpreadsheetAnyStatus(tenantId) : GF_Repository.getTenantSpreadsheet(tenantId);
    const row = GF_Repository.findOne(ss, GF_TENANT_SHEETS.BRANCHES, { tenant_id: tenantId, branch_id: branchId });
    return row ? this.toPublic(row) : null;
  },

  current: function (ctx) {
    if (!ctx.branchId) return null;
    const branch = this.getById(ctx.tenantId, ctx.branchId, false);
    return branch && branch.status === 'ACTIVE' ? branch : null;
  },

  create: function (ctx, payload, requestMeta) {
    GF_RbacService.require(ctx, 'branch.manage');
    const ss = GF_Repository.getTenantSpreadsheet(ctx.tenantId);
    const name = GF_Utils.requireString(payload && payload.name, 'name').slice(0, 120);
    const code = GF_Utils.normalizeCode(payload && payload.code ? payload.code : name);
    if (!code) throw GF_Errors.badRequest('Código de sede inválido.', 'BRANCH_CODE_INVALID');
    if (GF_Repository.findOne(ss, GF_TENANT_SHEETS.BRANCHES, { tenant_id: ctx.tenantId, code: code })) throw GF_Errors.conflict('Ya existe una sede con ese código.', 'BRANCH_CODE_EXISTS');
    const tenant = GF_Repository.findTenantRecord(ctx.tenantId);
    const existing = GF_Repository.findMany(ss, GF_TENANT_SHEETS.BRANCHES, { tenant_id: ctx.tenantId });
    const max = Number(tenant.max_branches || 0);
    if (max > 0 && existing.filter(function (row) { return row.status !== 'ARCHIVED'; }).length >= max) throw GF_Errors.conflict('El plan SaaS alcanzó el límite de sedes.', 'BRANCH_LIMIT_REACHED');
    const now = GF_Utils.nowIso();
    const record = {
      branch_id: GF_Utils.uuid('branch'), tenant_id: ctx.tenantId, name: name, code: code, status: 'ACTIVE',
      timezone: String(payload.timezone || tenant.timezone || GF_CONFIG.TIME_ZONE).slice(0, 64),
      address_text: String(payload.addressText || '').slice(0, 250), phone: String(payload.phone || '').slice(0, 40), email: GF_Utils.normalizeEmail(payload.email || ''),
      created_by: ctx.userId, created_at: now, updated_by: ctx.userId, updated_at: now, version: 1
    };
    GF_Repository.append(ss, GF_TENANT_SHEETS.BRANCHES, record);
    GF_AuditService.record(ctx, { module:'branches', action:'branch.create', entity:'Branch', recordId:record.branch_id, after:this.toPublic(record), correlationId:requestMeta && requestMeta.correlationId });
    return this.toPublic(record);
  },

  update: function (ctx, branchId, payload, requestMeta) {
    GF_RbacService.require(ctx, 'branch.manage');
    const ss = GF_Repository.getTenantSpreadsheet(ctx.tenantId);
    const before = GF_Repository.findOne(ss, GF_TENANT_SHEETS.BRANCHES, { tenant_id:ctx.tenantId, branch_id:branchId });
    if (!before) throw GF_Errors.notFound('Sede no encontrada.', 'BRANCH_NOT_FOUND');
    const patch = {};
    if (payload && Object.prototype.hasOwnProperty.call(payload,'name')) patch.name = GF_Utils.requireString(payload.name,'name').slice(0,120);
    if (payload && Object.prototype.hasOwnProperty.call(payload,'code')) {
      const code = GF_Utils.normalizeCode(payload.code);
      const duplicate = GF_Repository.readAll(ss, GF_TENANT_SHEETS.BRANCHES).find(function (r) { return r.tenant_id === ctx.tenantId && r.code === code && r.branch_id !== branchId; });
      if (duplicate) throw GF_Errors.conflict('Ya existe una sede con ese código.', 'BRANCH_CODE_EXISTS');
      patch.code = code;
    }
    const map = { timezone:'timezone', addressText:'address_text', phone:'phone', email:'email' };
    Object.keys(map).forEach(function (key) { if (payload && Object.prototype.hasOwnProperty.call(payload,key)) patch[map[key]] = String(payload[key] || '').slice(0,key === 'addressText' ? 250 : 64); });
    patch.updated_by = ctx.userId; patch.updated_at = GF_Utils.nowIso(); patch.version = Number(before.version || 1) + 1;
    const after = GF_Repository.updateByField(ss, GF_TENANT_SHEETS.BRANCHES, 'branch_id', branchId, patch);
    GF_AuditService.record(ctx, { module:'branches', action:'branch.update', entity:'Branch', recordId:branchId, before:this.toPublic(before), after:this.toPublic(after), correlationId:requestMeta && requestMeta.correlationId });
    return this.toPublic(after);
  },

  setStatus: function (ctx, branchId, status, requestMeta) {
    GF_RbacService.require(ctx, 'branch.manage');
    const next = String(status || '').toUpperCase();
    if (['ACTIVE','SUSPENDED'].indexOf(next) < 0) throw GF_Errors.badRequest('Estado de sede inválido.', 'BRANCH_STATUS_INVALID');
    const ss = GF_Repository.getTenantSpreadsheet(ctx.tenantId);
    const before = GF_Repository.findOne(ss, GF_TENANT_SHEETS.BRANCHES, { tenant_id:ctx.tenantId, branch_id:branchId });
    if (!before) throw GF_Errors.notFound('Sede no encontrada.', 'BRANCH_NOT_FOUND');
    const after = GF_Repository.updateByField(ss, GF_TENANT_SHEETS.BRANCHES, 'branch_id', branchId, { status:next, updated_by:ctx.userId, updated_at:GF_Utils.nowIso(), version:Number(before.version || 1)+1 });
    GF_AuditService.record(ctx, { module:'branches', action:next === 'ACTIVE' ? 'branch.reactivate' : 'branch.suspend', entity:'Branch', recordId:branchId, before:this.toPublic(before), after:this.toPublic(after), correlationId:requestMeta && requestMeta.correlationId });
    return this.toPublic(after);
  },

  toPublic: function (row) {
    return { branchId:row.branch_id, tenantId:row.tenant_id, name:row.name, code:row.code, status:row.status, timezone:row.timezone, addressText:row.address_text || '', phone:row.phone || '', email:row.email || '' };
  }
});
