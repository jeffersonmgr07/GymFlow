/** Resolución centralizada de RBAC. */
const GF_RbacService = Object.freeze({
  permissionsForRoles: function (roleIds) {
    const ids = (roleIds || []).map(String);
    if (!ids.length) return [];
    const cache = CacheService.getScriptCache();
    const cacheKey = 'rbac:' + GF_Utils.sha256Hex(ids.sort().join('|')).slice(0, 32);
    const cached = cache.get(cacheKey);
    if (cached) return GF_Utils.safeJsonParse(cached, []);

    const ss = GF_Repository.getPlatformSpreadsheet();
    const links = GF_Repository.readAll(ss, GF_PLATFORM_SHEETS.ROLE_PERMISSIONS).filter(function (row) {
      return ids.indexOf(String(row.role_id)) >= 0;
    });
    const permissionIds = links.map(function (row) { return String(row.permission_id); });
    const permissions = GF_Repository.readAll(ss, GF_PLATFORM_SHEETS.PERMISSIONS)
      .filter(function (row) { return permissionIds.indexOf(String(row.permission_id)) >= 0 && row.status === 'ACTIVE'; })
      .map(function (row) { return String(row.code); });
    const unique = Array.from(new Set(permissions));
    cache.put(cacheKey, JSON.stringify(unique), GF_CONFIG.CACHE_TTL_SECONDS);
    return unique;
  },

  require: function (ctx, permission) {
    if (!ctx) throw GF_Errors.unauthenticated();
    const permissions = ctx.permissions || [];
    if (permissions.indexOf('*') >= 0 || permissions.indexOf(permission) >= 0) return true;
    throw GF_Errors.forbidden('No tienes el permiso requerido: ' + permission, 'PERMISSION_DENIED');
  },

  has: function (ctx, permission) {
    const permissions = (ctx && ctx.permissions) || [];
    return permissions.indexOf('*') >= 0 || permissions.indexOf(permission) >= 0;
  }
});
