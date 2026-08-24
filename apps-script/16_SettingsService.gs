/** Configuración persistente del tenant y marca blanca por design tokens. */
const GF_SettingsService = Object.freeze({
  get: function (ctx) {
    GF_RbacService.require(ctx, 'settings.read');
    const ss = GF_Repository.getTenantSpreadsheet(ctx.tenantId);
    const rows = GF_Repository.findMany(ss, GF_TENANT_SHEETS.SETTINGS, { tenant_id:ctx.tenantId });
    const settings = {};
    rows.forEach(function (row) { if (!GF_Utils.asBoolean(row.is_sensitive)) settings[row.key] = GF_Utils.safeJsonParse(row.value_json, {}); });
    return settings;
  },

  update: function (ctx, key, value, requestMeta) {
    GF_RbacService.require(ctx, 'settings.manage');
    const allowed = ['branding','operations','localization'];
    if (allowed.indexOf(key) < 0) throw GF_Errors.badRequest('Clave de configuración no editable.', 'SETTING_KEY_NOT_ALLOWED');
    const sanitized = this.sanitize_(key, value || {});
    const ss = GF_Repository.getTenantSpreadsheet(ctx.tenantId);
    const id = 'setting_' + key;
    const before = GF_Repository.findOne(ss, GF_TENANT_SHEETS.SETTINGS, { setting_id:id });
    const now = GF_Utils.nowIso();
    const record = {
      setting_id:id, tenant_id:ctx.tenantId, key:key, value_json:JSON.stringify(sanitized), is_sensitive:false,
      created_by:before ? before.created_by : ctx.userId, created_at:before ? before.created_at : now, updated_by:ctx.userId, updated_at:now, version:before ? Number(before.version || 1)+1 : 1
    };
    if (before) GF_Repository.updateByField(ss, GF_TENANT_SHEETS.SETTINGS, 'setting_id', id, record); else GF_Repository.append(ss, GF_TENANT_SHEETS.SETTINGS, record);

    if (key === 'branding' || key === 'localization') {
      const platform = GF_Repository.getPlatformSpreadsheet();
      const tenant = GF_Repository.findOne(platform, GF_PLATFORM_SHEETS.TENANTS, { tenant_id:ctx.tenantId });
      const patch = { updated_by:ctx.userId, updated_at:now, version:Number(tenant.version || 1)+1 };
      if (key === 'branding' && sanitized.themeKey) patch.theme_key = sanitized.themeKey;
      if (key === 'localization') {
        if (sanitized.currency) patch.currency = sanitized.currency;
        if (sanitized.locale) patch.locale = sanitized.locale;
        if (sanitized.timezone) patch.timezone = sanitized.timezone;
      }
      GF_Repository.updateByField(platform, GF_PLATFORM_SHEETS.TENANTS, 'tenant_id', ctx.tenantId, patch);
    }
    GF_AuditService.record(ctx, { module:'settings', action:'tenant.setting.update', entity:'TenantSetting', recordId:id, before:before ? GF_Utils.safeJsonParse(before.value_json,{}) : null, after:sanitized, correlationId:requestMeta && requestMeta.correlationId });
    return { key:key, value:sanitized };
  },

  ensureDefaultsForTenant_: function (tenantId, name, themeKey, actorId) {
    const ss = GF_Repository.getTenantSpreadsheetAnyStatus(tenantId);
    const now = GF_Utils.nowIso();
    const defaults = {
      branding: { brandName:name, slogan:'', logoUrl:'', logoDarkUrl:'', faviconUrl:'', themeKey:themeKey || 'iron', customColors:{} },
      operations: { defaultBranchId:'', allowBranchSwitch:true },
      localization: { currency:'PEN', locale:'es-PE', timezone:GF_CONFIG.TIME_ZONE }
    };
    Object.keys(defaults).forEach(function (key) {
      const id='setting_'+key;
      if (!GF_Repository.findOne(ss, GF_TENANT_SHEETS.SETTINGS, { setting_id:id })) GF_Repository.append(ss, GF_TENANT_SHEETS.SETTINGS, { setting_id:id, tenant_id:tenantId, key:key, value_json:JSON.stringify(defaults[key]), is_sensitive:false, created_by:actorId || 'setup', created_at:now, updated_by:actorId || 'setup', updated_at:now, version:1 });
    });
  },

  sanitize_: function (key, value) {
    if (key === 'branding') {
      const themeKey = String(value.themeKey || 'iron').slice(0,40);
      const colors = value.customColors && typeof value.customColors === 'object' ? value.customColors : {};
      const allowedColorKeys = ['primary','secondary','accent','background','surface','surface2','text','muted','border','success','warning','danger'];
      const safeColors = {};
      allowedColorKeys.forEach(function (k) { const v=String(colors[k] || ''); if (/^#[0-9A-Fa-f]{6}$/.test(v)) safeColors[k]=v; });
      return { brandName:String(value.brandName || '').slice(0,120), slogan:String(value.slogan || '').slice(0,180), logoUrl:String(value.logoUrl || '').slice(0,500), logoDarkUrl:String(value.logoDarkUrl || '').slice(0,500), faviconUrl:String(value.faviconUrl || '').slice(0,500), themeKey:themeKey, customColors:safeColors };
    }
    if (key === 'localization') return { currency:String(value.currency || 'PEN').slice(0,8), locale:String(value.locale || 'es-PE').slice(0,12), timezone:String(value.timezone || GF_CONFIG.TIME_ZONE).slice(0,64) };
    if (key === 'operations') return { defaultBranchId:String(value.defaultBranchId || '').slice(0,80), allowBranchSwitch:value.allowBranchSwitch !== false };
    return {};
  }
});
