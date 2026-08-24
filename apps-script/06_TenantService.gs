const GF_TenantService = Object.freeze({
  current: function (ctx) {
    GF_RbacService.require(ctx, 'tenant.read');
    if (!ctx.tenantId) throw GF_Errors.forbidden('Esta sesión no tiene un gimnasio asignado.', 'TENANT_CONTEXT_REQUIRED');
    const tenant = GF_Repository.findTenantRecord(ctx.tenantId);
    if (!tenant) throw GF_Errors.notFound('Gimnasio no encontrado.', 'TENANT_NOT_FOUND');
    return this.toPublic(tenant);
  },

  listPlatform: function (ctx) {
    GF_RbacService.require(ctx, 'platform.tenants.read');
    return GF_Repository.readAll(GF_Repository.getPlatformSpreadsheet(), GF_PLATFORM_SHEETS.TENANTS)
      .map(this.toPlatformView)
      .sort(function (a, b) { return a.name.localeCompare(b.name); });
  },

  getPlatform: function (ctx, tenantId) {
    GF_RbacService.require(ctx, 'platform.tenants.read');
    const tenant = GF_Repository.findTenantRecord(tenantId);
    if (!tenant) throw GF_Errors.notFound('Gimnasio no encontrado.', 'TENANT_NOT_FOUND');
    return this.toPlatformView(tenant);
  },

  createPlatform: function (ctx, payload, requestMeta) {
    GF_RbacService.require(ctx, 'platform.tenants.manage');
    const platform = GF_Repository.getPlatformSpreadsheet();
    const name = GF_Utils.requireString(payload && payload.name, 'name').slice(0, 120);
    const slug = GF_Utils.slugify(payload && payload.slug ? payload.slug : name);
    if (!slug) throw GF_Errors.badRequest('Slug inválido.', 'VALIDATION_SLUG');
    if (GF_Repository.findOne(platform, GF_PLATFORM_SHEETS.TENANTS, { slug: slug })) throw GF_Errors.conflict('Ya existe un gimnasio con ese slug.', 'TENANT_SLUG_EXISTS');

    const ownerName = GF_Utils.requireString(payload && payload.ownerName, 'ownerName').slice(0, 120);
    const ownerEmail = GF_Utils.requireEmail(payload && payload.ownerEmail, 'ownerEmail');
    const tenantId = GF_Utils.uuid('tenant');
    const branchId = GF_Utils.uuid('branch');
    const ownerId = GF_Utils.uuid('usr');
    const now = GF_Utils.nowIso();
    const props = PropertiesService.getScriptProperties();
    const folderId = props.getProperty(GF_CONFIG.DATA_FOLDER_PROP);
    if (!folderId) throw GF_Errors.conflict('Ejecuta setupGymFlowPhase1() antes de crear gimnasios.', 'SETUP_REQUIRED');
    const folder = DriveApp.getFolderById(folderId);

    const tenantSs = SpreadsheetApp.create('GymFlow OS - ' + name);
    DriveApp.getFileById(tenantSs.getId()).moveTo(folder);
    gfEnsureSheets_(tenantSs, GF_TENANT_HEADERS);

    const record = {
      tenant_id: tenantId,
      name: name,
      slug: slug,
      status: 'ACTIVE',
      spreadsheet_id: tenantSs.getId(),
      theme_key: String(payload.themeKey || 'iron').slice(0, 40),
      currency: String(payload.currency || 'PEN').slice(0, 8),
      locale: String(payload.locale || 'es-PE').slice(0, 12),
      timezone: String(payload.timezone || GF_CONFIG.TIME_ZONE).slice(0, 64),
      plan_key: String(payload.planKey || 'INICIO').slice(0, 30),
      max_branches: Number(payload.maxBranches || 1),
      max_active_members: Number(payload.maxActiveMembers || 150),
      suspended_at: '',
      suspended_reason: '',
      created_by: ctx.userId,
      created_at: now,
      updated_by: ctx.userId,
      updated_at: now,
      version: 1
    };
    GF_Repository.append(platform, GF_PLATFORM_SHEETS.TENANTS, record);

    GF_Repository.append(tenantSs, GF_TENANT_SHEETS.BRANCHES, {
      branch_id: branchId, tenant_id: tenantId, name: String(payload.branchName || 'Sede Principal').slice(0, 120), code: 'PRINCIPAL', status: 'ACTIVE',
      timezone: record.timezone, address_text: String(payload.addressText || '').slice(0, 250), phone: '', email: '',
      created_by: ctx.userId, created_at: now, updated_by: ctx.userId, updated_at: now, version: 1
    });
    GF_Repository.append(tenantSs, GF_TENANT_SHEETS.USERS, {
      user_id: ownerId, tenant_id: tenantId, branch_id: branchId, email: ownerEmail, display_name: ownerName, public_name: ownerName, status: 'ACTIVE', avatar_url: '',
      auth_provider: 'firebase', auth_uid: '', last_login_at: '', created_by: ctx.userId, created_at: now, updated_by: ctx.userId, updated_at: now, version: 1
    });
    GF_Repository.append(tenantSs, GF_TENANT_SHEETS.USER_ROLES, {
      user_role_id: GF_Utils.uuid('ur'), tenant_id: tenantId, branch_id: branchId, user_id: ownerId, role_id: 'role_gym_owner', status: 'ACTIVE',
      created_by: ctx.userId, created_at: now, updated_by: ctx.userId, updated_at: now, version: 1
    });
    GF_IdentityService.ensurePendingFirebaseIdentity_(ownerEmail, ownerId, tenantId, branchId, ctx.userId);
    GF_SettingsService.ensureDefaultsForTenant_(tenantId, name, record.theme_key, ctx.userId);

    GF_AuditService.recordPlatform(ctx, { module: 'platform', action: 'tenant.create', entity: 'Tenant', recordId: tenantId, after: this.toPlatformView(record), correlationId: requestMeta && requestMeta.correlationId });
    return this.toPlatformView(record);
  },

  updatePlatform: function (ctx, tenantId, payload, requestMeta) {
    GF_RbacService.require(ctx, 'platform.tenants.manage');
    const platform = GF_Repository.getPlatformSpreadsheet();
    const before = GF_Repository.findOne(platform, GF_PLATFORM_SHEETS.TENANTS, { tenant_id: tenantId });
    if (!before) throw GF_Errors.notFound('Gimnasio no encontrado.', 'TENANT_NOT_FOUND');
    const patch = {};
    if (payload && Object.prototype.hasOwnProperty.call(payload, 'name')) patch.name = GF_Utils.requireString(payload.name, 'name').slice(0, 120);
    if (payload && Object.prototype.hasOwnProperty.call(payload, 'slug')) {
      const slug = GF_Utils.slugify(payload.slug);
      const duplicate = GF_Repository.readAll(platform, GF_PLATFORM_SHEETS.TENANTS).find(function (row) { return row.slug === slug && row.tenant_id !== tenantId; });
      if (duplicate) throw GF_Errors.conflict('Ya existe un gimnasio con ese slug.', 'TENANT_SLUG_EXISTS');
      patch.slug = slug;
    }
    ['themeKey','currency','locale','timezone','planKey','maxBranches','maxActiveMembers'].forEach(function (key) {
      if (!payload || !Object.prototype.hasOwnProperty.call(payload, key)) return;
      const map = { themeKey:'theme_key', currency:'currency', locale:'locale', timezone:'timezone', planKey:'plan_key', maxBranches:'max_branches', maxActiveMembers:'max_active_members' };
      patch[map[key]] = key === 'maxBranches' || key === 'maxActiveMembers' ? Number(payload[key]) : String(payload[key]).slice(0, 64);
    });
    patch.updated_by = ctx.userId;
    patch.updated_at = GF_Utils.nowIso();
    patch.version = Number(before.version || 1) + 1;
    const after = GF_Repository.updateByField(platform, GF_PLATFORM_SHEETS.TENANTS, 'tenant_id', tenantId, patch);
    GF_AuditService.recordPlatform(ctx, { module:'platform', action:'tenant.update', entity:'Tenant', recordId:tenantId, before:this.toPlatformView(before), after:this.toPlatformView(after), correlationId:requestMeta && requestMeta.correlationId });
    return this.toPlatformView(after);
  },

  setStatusPlatform: function (ctx, tenantId, status, reason, requestMeta) {
    GF_RbacService.require(ctx, 'platform.tenants.manage');
    const next = String(status || '').toUpperCase();
    if (['ACTIVE','SUSPENDED'].indexOf(next) < 0) throw GF_Errors.badRequest('Estado de gimnasio inválido.', 'TENANT_STATUS_INVALID');
    const platform = GF_Repository.getPlatformSpreadsheet();
    const before = GF_Repository.findOne(platform, GF_PLATFORM_SHEETS.TENANTS, { tenant_id: tenantId });
    if (!before) throw GF_Errors.notFound('Gimnasio no encontrado.', 'TENANT_NOT_FOUND');
    if (before.status === next) return this.toPlatformView(before);
    const now = GF_Utils.nowIso();
    const after = GF_Repository.updateByField(platform, GF_PLATFORM_SHEETS.TENANTS, 'tenant_id', tenantId, {
      status: next,
      suspended_at: next === 'SUSPENDED' ? now : '',
      suspended_reason: next === 'SUSPENDED' ? String(reason || '').slice(0, 300) : '',
      updated_by: ctx.userId,
      updated_at: now,
      version: Number(before.version || 1) + 1
    });
    if (next === 'SUSPENDED') GF_SessionService.revokeForTenant(tenantId);
    GF_AuditService.recordPlatform(ctx, { module:'platform', action:next === 'ACTIVE' ? 'tenant.reactivate' : 'tenant.suspend', entity:'Tenant', recordId:tenantId, before:this.toPlatformView(before), after:this.toPlatformView(after), reason:reason || '', correlationId:requestMeta && requestMeta.correlationId });
    return this.toPlatformView(after);
  },

  toPublic: function (tenant) {
    return {
      tenantId: tenant.tenant_id, name: tenant.name, slug: tenant.slug, status: tenant.status, themeKey: tenant.theme_key,
      currency: tenant.currency, locale: tenant.locale, timezone: tenant.timezone
    };
  },

  toPlatformView: function (tenant) {
    return {
      tenantId: tenant.tenant_id, name: tenant.name, slug: tenant.slug, status: tenant.status, themeKey: tenant.theme_key,
      currency: tenant.currency, locale: tenant.locale, timezone: tenant.timezone, planKey: tenant.plan_key || 'INICIO',
      maxBranches: Number(tenant.max_branches || 0), maxActiveMembers: Number(tenant.max_active_members || 0),
      suspendedAt: tenant.suspended_at || null, suspendedReason: tenant.suspended_reason || '', createdAt: tenant.created_at, updatedAt: tenant.updated_at
    };
  }
});
