/**
 * Setup idempotente de Fase 1.
 * Primera instalación: ejecutar setupGymFlowPhase1().
 * Instalaciones v0.2.x existentes: usar migrateGymFlowPhase1ToV030() después de clasp push.
 */
function setupGymFlowPhase1() {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const props = PropertiesService.getScriptProperties();
    const folder = gfEnsureDataFolder_(props);
    const platform = gfEnsurePlatformSpreadsheet_(props, folder);
    gfEnsureSheets_(platform, GF_PLATFORM_HEADERS);
    gfSeedPlatformCatalogs_(platform);

    const tenantDefinitions = gfDemoTenantDefinitions_();
    tenantDefinitions.forEach(function (definition) {
      const tenantSs = gfEnsureTenantSpreadsheet_(platform, definition, folder);
      gfEnsureSheets_(tenantSs, GF_TENANT_HEADERS);
      gfSeedTenantCore_(tenantSs, definition);
      gfSeedTenantDashboard_(tenantSs, definition);
      GF_SettingsService.ensureDefaultsForTenant_(definition.tenantId, definition.name, definition.themeKey, 'setup');
    });

    gfSeedDemoIdentities_(platform);
    gfSeedPendingAuthIdentitiesFromTenantUsers_(platform);
    if (props.getProperty(GF_CONFIG.DEMO_MODE_PROP) === null) props.setProperty(GF_CONFIG.DEMO_MODE_PROP, 'true');
    if (props.getProperty(GF_CONFIG.FIREBASE_ENABLED_PROP) === null) props.setProperty(GF_CONFIG.FIREBASE_ENABLED_PROP, 'false');
    if (props.getProperty(GF_CONFIG.RBAC_VERSION_PROP) === null) props.setProperty(GF_CONFIG.RBAC_VERSION_PROP, '1');
    gfRecordMigration_(platform, 'phase1_v030', 'Administrative CRUD, RBAC matrix, branding, branch switch and Firebase adapter');

    return {
      ok:true,
      apiVersion:GF_CONFIG.API_VERSION,
      platformSpreadsheetId:platform.getId(),
      dataFolderId:folder.getId(),
      demoMode:props.getProperty(GF_CONFIG.DEMO_MODE_PROP),
      firebaseEnabled:props.getProperty(GF_CONFIG.FIREBASE_ENABLED_PROP),
      tenants:GF_Repository.readAll(platform, GF_PLATFORM_SHEETS.TENANTS).map(function (row) { return { tenantId:row.tenant_id, name:row.name, spreadsheetId:row.spreadsheet_id, status:row.status }; })
    };
  } finally {
    lock.releaseLock();
  }
}

function gfEnsureDataFolder_(props) {
  const existingId = props.getProperty(GF_CONFIG.DATA_FOLDER_PROP);
  if (existingId) { try { return DriveApp.getFolderById(existingId); } catch (_) {} }
  const folder = DriveApp.createFolder('GymFlow OS - Data Demo');
  props.setProperty(GF_CONFIG.DATA_FOLDER_PROP, folder.getId());
  return folder;
}

function gfEnsurePlatformSpreadsheet_(props, folder) {
  const existingId = props.getProperty(GF_CONFIG.PLATFORM_PROP);
  if (existingId) { try { return SpreadsheetApp.openById(existingId); } catch (_) {} }
  const ss = SpreadsheetApp.create('GymFlow OS - Plataforma');
  DriveApp.getFileById(ss.getId()).moveTo(folder);
  props.setProperty(GF_CONFIG.PLATFORM_PROP, ss.getId());
  return ss;
}

function gfEnsureTenantSpreadsheet_(platform, definition, folder) {
  let tenant = GF_Repository.findOne(platform, GF_PLATFORM_SHEETS.TENANTS, { tenant_id:definition.tenantId });
  let tenantSs = null;
  if (tenant && tenant.spreadsheet_id) { try { tenantSs = SpreadsheetApp.openById(tenant.spreadsheet_id); } catch (_) { tenantSs = null; } }
  if (!tenantSs) {
    tenantSs = SpreadsheetApp.create('GymFlow OS - ' + definition.name);
    DriveApp.getFileById(tenantSs.getId()).moveTo(folder);
  }
  const now = GF_Utils.nowIso();
  if (!tenant) {
    tenant = {
      tenant_id:definition.tenantId, name:definition.name, slug:definition.slug, status:'ACTIVE', spreadsheet_id:tenantSs.getId(), theme_key:definition.themeKey,
      currency:'PEN', locale:'es-PE', timezone:GF_CONFIG.TIME_ZONE, plan_key:'CRECIMIENTO', max_branches:3, max_active_members:500,
      suspended_at:'', suspended_reason:'', created_by:'setup', created_at:now, updated_by:'setup', updated_at:now, version:1
    };
    GF_Repository.append(platform, GF_PLATFORM_SHEETS.TENANTS, tenant);
  } else {
    const patch = {};
    if (!tenant.spreadsheet_id) patch.spreadsheet_id = tenantSs.getId();
    if (!tenant.plan_key) patch.plan_key = 'CRECIMIENTO';
    if (!tenant.max_branches) patch.max_branches = 3;
    if (!tenant.max_active_members) patch.max_active_members = 500;
    if (!tenant.created_by) patch.created_by = 'setup';
    if (Object.keys(patch).length) {
      patch.updated_at = now; patch.updated_by = 'setup'; patch.version = Number(tenant.version || 1) + 1;
      GF_Repository.updateByField(platform, GF_PLATFORM_SHEETS.TENANTS, 'tenant_id', definition.tenantId, patch);
    }
  }
  return tenantSs;
}

function gfEnsureSheets_(ss, schemas) {
  Object.keys(schemas).forEach(function (sheetName) {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) sheet = ss.insertSheet(sheetName);
    const headers = schemas[sheetName];
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1,1,1,headers.length).setValues([headers]);
    } else {
      const width = Math.max(sheet.getLastColumn(),1);
      const current = sheet.getRange(1,1,1,width).getValues()[0].map(String).filter(Boolean);
      const missing = headers.filter(function (header) { return current.indexOf(header) < 0; });
      if (missing.length) sheet.getRange(1,current.length+1,1,missing.length).setValues([missing]);
    }
    sheet.setFrozenRows(1);
  });
  const defaultSheet = ss.getSheetByName('Sheet1') || ss.getSheetByName('Hoja 1');
  if (defaultSheet && ss.getSheets().length > 1 && defaultSheet.getLastRow() === 0) ss.deleteSheet(defaultSheet);
}

function gfRecordMigration_(platform, migrationId, name) {
  const existing = GF_Repository.findOne(platform, GF_PLATFORM_SHEETS.MIGRATIONS, { migration_id:migrationId });
  if (existing) return existing;
  const record = { migration_id:migrationId, name:name, applied_at:GF_Utils.nowIso(), checksum:GF_Utils.sha256Hex(migrationId + '|' + name), status:'APPLIED', version:1 };
  GF_Repository.append(platform, GF_PLATFORM_SHEETS.MIGRATIONS, record);
  return record;
}
