/** Pruebas ejecutables manualmente desde Apps Script. No reemplazan un runner CI. */
function runPhase1SmokeTests() {
  const results = [];
  function test(name, fn) {
    try { fn(); results.push({ name:name, ok:true }); }
    catch (error) { results.push({ name:name, ok:false, error:error.message, code:error.code || '' }); }
  }
  function assert(condition, message) { if (!condition) throw new Error(message); }

  test('setup disponible', function () {
    const platform = GF_Repository.getPlatformSpreadsheet();
    assert(Boolean(platform.getId()), 'No existe Spreadsheet plataforma.');
  });

  test('dos tenants demo aislados', function () {
    const platform = GF_Repository.getPlatformSpreadsheet();
    const tenants = GF_Repository.readAll(platform, GF_PLATFORM_SHEETS.TENANTS);
    assert(tenants.length >= 2, 'Se esperaban al menos dos tenants.');
    assert(tenants[0].spreadsheet_id !== tenants[1].spreadsheet_id, 'Los tenants no deben compartir Spreadsheet.');
  });

  test('usuario Iron Factory no aparece en Ocean Fit', function () {
    const ironUser = GF_UserService.getByIdForTenant('tenant_demo_iron_factory', 'usr_demo_admin');
    const oceanLeak = GF_UserService.getByIdForTenant('tenant_demo_ocean_fit', 'usr_demo_admin');
    assert(Boolean(ironUser), 'Usuario demo Iron no encontrado.');
    assert(oceanLeak === null, 'Fuga de usuario entre tenants detectada.');
  });

  test('RBAC cajero no puede listar usuarios', function () {
    const permissions = GF_RbacService.permissionsForRoles(['role_reception_cashier']);
    assert(permissions.indexOf('user.read') === -1, 'El cajero no debería tener user.read en Fase 1.');
  });

  test('RBAC propietario puede leer auditoría', function () {
    const permissions = GF_RbacService.permissionsForRoles(['role_gym_owner']);
    assert(permissions.indexOf('audit.read') >= 0, 'El propietario debe poder leer auditoría.');
  });

  Logger.log(JSON.stringify(results, null, 2));
  return { ok: results.every(function (r) { return r.ok; }), results: results };
}
