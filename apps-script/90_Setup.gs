/**
 * Setup idempotente de Fase 1.
 * Ejecutar manualmente desde Apps Script una vez y volver a ejecutar después de cambios de esquema.
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
    });

    gfSeedDemoIdentities_(platform);
    if (props.getProperty(GF_CONFIG.DEMO_MODE_PROP) === null) props.setProperty(GF_CONFIG.DEMO_MODE_PROP, 'true');

    return {
      ok: true,
      platformSpreadsheetId: platform.getId(),
      dataFolderId: folder.getId(),
      demoMode: props.getProperty(GF_CONFIG.DEMO_MODE_PROP),
      tenants: GF_Repository.readAll(platform, GF_PLATFORM_SHEETS.TENANTS).map(function (row) {
        return { tenantId: row.tenant_id, name: row.name, spreadsheetId: row.spreadsheet_id };
      })
    };
  } finally {
    lock.releaseLock();
  }
}

function gfEnsureDataFolder_(props) {
  const existingId = props.getProperty(GF_CONFIG.DATA_FOLDER_PROP);
  if (existingId) {
    try { return DriveApp.getFolderById(existingId); } catch (_) {}
  }
  const folder = DriveApp.createFolder('GymFlow OS - Data Demo');
  props.setProperty(GF_CONFIG.DATA_FOLDER_PROP, folder.getId());
  return folder;
}

function gfEnsurePlatformSpreadsheet_(props, folder) {
  const existingId = props.getProperty(GF_CONFIG.PLATFORM_PROP);
  if (existingId) {
    try { return SpreadsheetApp.openById(existingId); } catch (_) {}
  }
  const ss = SpreadsheetApp.create('GymFlow OS - Plataforma');
  DriveApp.getFileById(ss.getId()).moveTo(folder);
  props.setProperty(GF_CONFIG.PLATFORM_PROP, ss.getId());
  return ss;
}

function gfEnsureTenantSpreadsheet_(platform, definition, folder) {
  let tenant = GF_Repository.findOne(platform, GF_PLATFORM_SHEETS.TENANTS, { tenant_id: definition.tenantId });
  let tenantSs = null;
  if (tenant && tenant.spreadsheet_id) {
    try { tenantSs = SpreadsheetApp.openById(tenant.spreadsheet_id); } catch (_) { tenantSs = null; }
  }
  if (!tenantSs) {
    tenantSs = SpreadsheetApp.create('GymFlow OS - ' + definition.name);
    DriveApp.getFileById(tenantSs.getId()).moveTo(folder);
  }
  const now = GF_Utils.nowIso();
  const record = {
    tenant_id: definition.tenantId,
    name: definition.name,
    slug: definition.slug,
    status: 'ACTIVE',
    spreadsheet_id: tenantSs.getId(),
    theme_key: definition.themeKey,
    currency: 'PEN',
    locale: 'es-PE',
    timezone: 'America/Lima',
    created_at: tenant && tenant.created_at ? tenant.created_at : now,
    updated_at: now,
    version: tenant ? Number(tenant.version || 1) + 1 : 1
  };
  if (tenant) GF_Repository.updateByField(platform, GF_PLATFORM_SHEETS.TENANTS, 'tenant_id', definition.tenantId, record);
  else GF_Repository.append(platform, GF_PLATFORM_SHEETS.TENANTS, record);
  return tenantSs;
}

function gfEnsureSheets_(ss, schemas) {
  Object.keys(schemas).forEach(function (sheetName) {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) sheet = ss.insertSheet(sheetName);
    const headers = schemas[sheetName];
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    } else {
      const current = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0].filter(String);
      const missing = headers.filter(function (header) { return current.indexOf(header) < 0; });
      if (missing.length) sheet.getRange(1, current.length + 1, 1, missing.length).setValues([missing]);
    }
    sheet.setFrozenRows(1);
  });
  const defaultSheet = ss.getSheetByName('Sheet1') || ss.getSheetByName('Hoja 1');
  if (defaultSheet && ss.getSheets().length > 1 && defaultSheet.getLastRow() === 0) ss.deleteSheet(defaultSheet);
}
