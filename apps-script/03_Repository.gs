/** Acceso genérico a Google Sheets. Ningún servicio debe depender de números de columna fijos. */
const GF_Repository = Object.freeze({
  getPlatformSpreadsheet: function () {
    const id = PropertiesService.getScriptProperties().getProperty(GF_CONFIG.PLATFORM_PROP);
    if (!id) throw GF_Errors.conflict('Ejecuta setupGymFlowPhase1() antes de usar el API.', 'SETUP_REQUIRED');
    return SpreadsheetApp.openById(id);
  },

  getTenantSpreadsheet: function (tenantId) {
    const tenant = this.findOne(this.getPlatformSpreadsheet(), GF_PLATFORM_SHEETS.TENANTS, { tenant_id: tenantId, status: 'ACTIVE' });
    if (!tenant) throw GF_Errors.notFound('Gimnasio no encontrado o suspendido.', 'TENANT_NOT_AVAILABLE');
    return SpreadsheetApp.openById(tenant.spreadsheet_id);
  },

  readAll: function (spreadsheet, sheetName) {
    const sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet) throw GF_Errors.notFound('Hoja no encontrada: ' + sheetName, 'SHEET_NOT_FOUND');
    const values = sheet.getDataRange().getValues();
    if (values.length < 2) return [];
    const headers = values[0].map(String);
    return values.slice(1).filter(function (row) {
      return row.some(function (cell) { return cell !== ''; });
    }).map(function (row) {
      const obj = {};
      headers.forEach(function (header, i) { obj[header] = row[i]; });
      return obj;
    });
  },

  findMany: function (spreadsheet, sheetName, filters) {
    const rows = this.readAll(spreadsheet, sheetName);
    const keys = Object.keys(filters || {});
    if (!keys.length) return rows;
    return rows.filter(function (row) {
      return keys.every(function (key) { return String(row[key]) === String(filters[key]); });
    });
  },

  findOne: function (spreadsheet, sheetName, filters) {
    return this.findMany(spreadsheet, sheetName, filters)[0] || null;
  },

  append: function (spreadsheet, sheetName, record) {
    const sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet) throw GF_Errors.notFound('Hoja no encontrada: ' + sheetName, 'SHEET_NOT_FOUND');
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(String);
    const row = headers.map(function (header) {
      const value = record[header];
      if (value === undefined || value === null) return '';
      return typeof value === 'object' ? JSON.stringify(value) : value;
    });
    sheet.appendRow(row);
    return record;
  },

  updateByField: function (spreadsheet, sheetName, idField, idValue, patch) {
    const sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet || sheet.getLastRow() < 2) return null;
    const values = sheet.getDataRange().getValues();
    const headers = values[0].map(String);
    const idIndex = headers.indexOf(idField);
    if (idIndex < 0) throw GF_Errors.conflict('Campo identificador no existe: ' + idField, 'SCHEMA_ERROR');
    const rowIndex = values.findIndex(function (row, index) { return index > 0 && String(row[idIndex]) === String(idValue); });
    if (rowIndex < 1) return null;
    const updated = {};
    headers.forEach(function (header, colIndex) {
      updated[header] = Object.prototype.hasOwnProperty.call(patch, header) ? patch[header] : values[rowIndex][colIndex];
    });
    sheet.getRange(rowIndex + 1, 1, 1, headers.length).setValues([headers.map(function (header) {
      const value = updated[header];
      return typeof value === 'object' ? JSON.stringify(value) : value;
    })]);
    return updated;
  }
});
