/** Migración no destructiva desde v0.2.x a v0.3.0. */
function migrateGymFlowPhase1ToV030() {
  const lock=LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const platform=GF_Repository.getPlatformSpreadsheet();
    gfEnsureSheets_(platform,GF_PLATFORM_HEADERS);
    gfSeedPlatformCatalogs_(platform);
    const tenants=GF_Repository.readAll(platform,GF_PLATFORM_SHEETS.TENANTS);
    tenants.forEach(function (tenant) {
      if (!tenant.spreadsheet_id) return;
      const ss=SpreadsheetApp.openById(tenant.spreadsheet_id);
      gfEnsureSheets_(ss,GF_TENANT_HEADERS);
      const patch={};
      if (!tenant.plan_key) patch.plan_key='CRECIMIENTO';
      if (!tenant.max_branches) patch.max_branches=3;
      if (!tenant.max_active_members) patch.max_active_members=500;
      if (!tenant.created_by) patch.created_by='migration_v030';
      if (Object.keys(patch).length) {
        patch.updated_by='migration_v030'; patch.updated_at=GF_Utils.nowIso(); patch.version=Number(tenant.version || 1)+1;
        GF_Repository.updateByField(platform,GF_PLATFORM_SHEETS.TENANTS,'tenant_id',tenant.tenant_id,patch);
      }
      GF_SettingsService.ensureDefaultsForTenant_(tenant.tenant_id,tenant.name,tenant.theme_key,'migration_v030');
    });
    gfSeedPendingAuthIdentitiesFromTenantUsers_(platform);
    const props=PropertiesService.getScriptProperties();
    if (props.getProperty(GF_CONFIG.FIREBASE_ENABLED_PROP)===null) props.setProperty(GF_CONFIG.FIREBASE_ENABLED_PROP,'false');
    if (props.getProperty(GF_CONFIG.RBAC_VERSION_PROP)===null) props.setProperty(GF_CONFIG.RBAC_VERSION_PROP,'1');
    gfRecordMigration_(platform,'phase1_v030','Administrative CRUD, RBAC matrix, branding, branch switch and Firebase adapter');
    return { ok:true, apiVersion:GF_CONFIG.API_VERSION, tenantsMigrated:tenants.length, firebaseEnabled:props.getProperty(GF_CONFIG.FIREBASE_ENABLED_PROP) };
  } finally { lock.releaseLock(); }
}
