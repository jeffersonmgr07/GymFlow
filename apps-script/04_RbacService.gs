/** Resolución centralizada de RBAC. */
const GF_RbacService = Object.freeze({
  cacheKeyForRoles: function (roleIds) {
    const version = PropertiesService.getScriptProperties().getProperty(GF_CONFIG.RBAC_VERSION_PROP) || '1';
    return 'rbac:' + version + ':' + GF_Utils.sha256Hex((roleIds || []).map(String).sort().join('|')).slice(0, 32);
  },

  permissionsForRoles: function (roleIds) {
    const ids = (roleIds || []).map(String);
    if (!ids.length) return [];
    const cache = CacheService.getScriptCache();
    const cacheKey = this.cacheKeyForRoles(ids);
    const cached = cache.get(cacheKey);
    if (cached) return GF_Utils.safeJsonParse(cached, []);

    const ss = GF_Repository.getPlatformSpreadsheet();
    const links = GF_Repository.readAll(ss, GF_PLATFORM_SHEETS.ROLE_PERMISSIONS).filter(function (row) {
      const active = !row.status || row.status === 'ACTIVE';
      return active && ids.indexOf(String(row.role_id)) >= 0;
    });
    const permissionIds = links.map(function (row) { return String(row.permission_id); });
    const permissions = GF_Repository.readAll(ss, GF_PLATFORM_SHEETS.PERMISSIONS)
      .filter(function (row) { return permissionIds.indexOf(String(row.permission_id)) >= 0 && row.status === 'ACTIVE'; })
      .map(function (row) { return String(row.code); });
    const unique = Array.from(new Set(permissions));
    cache.put(cacheKey, JSON.stringify(unique), GF_CONFIG.CACHE_TTL_SECONDS);
    return unique;
  },

  bumpVersion: function () {
    const props = PropertiesService.getScriptProperties();
    const current = Number(props.getProperty(GF_CONFIG.RBAC_VERSION_PROP) || 1);
    props.setProperty(GF_CONFIG.RBAC_VERSION_PROP, String(current + 1));
    return current + 1;
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
