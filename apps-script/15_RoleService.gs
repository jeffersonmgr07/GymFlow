/** Catálogo de roles, asignaciones y matriz base de permisos. */
const GF_RoleService = Object.freeze({
  list: function (ctx) {
    if (ctx.tenantId) GF_RbacService.require(ctx, 'role.read');
    else GF_RbacService.require(ctx, 'platform.roles.read');
    return GF_Repository.readAll(GF_Repository.getPlatformSpreadsheet(), GF_PLATFORM_SHEETS.ROLES)
      .filter(function (row) { return row.status === 'ACTIVE' && (ctx.tenantId ? row.scope === 'TENANT' : true); })
      .map(function (row) { return { roleId:row.role_id, name:row.name, scope:row.scope, description:row.description }; });
  },

  matrix: function (ctx) {
    if (ctx.tenantId) GF_RbacService.require(ctx, 'role.read');
    else GF_RbacService.require(ctx, 'platform.roles.read');
    const platform = GF_Repository.getPlatformSpreadsheet();
    const roles = GF_Repository.readAll(platform, GF_PLATFORM_SHEETS.ROLES).filter(function (r) { return r.status === 'ACTIVE' && r.scope === 'TENANT'; });
    const permissions = GF_Repository.readAll(platform, GF_PLATFORM_SHEETS.PERMISSIONS).filter(function (p) { return p.status === 'ACTIVE' && String(p.code).indexOf('platform.') !== 0; });
    const links = GF_Repository.readAll(platform, GF_PLATFORM_SHEETS.ROLE_PERMISSIONS).filter(function (rp) { return !rp.status || rp.status === 'ACTIVE'; });
    return {
      editable: !ctx.tenantId && GF_RbacService.has(ctx, 'platform.roles.manage'),
      roles: roles.map(function (r) { return { roleId:r.role_id, name:r.name, description:r.description }; }),
      permissions: permissions.map(function (p) { return { permissionId:p.permission_id, code:p.code, module:p.module, action:p.action, description:p.description }; }),
      grants: links.reduce(function (acc, link) { if (!acc[link.role_id]) acc[link.role_id]=[]; acc[link.role_id].push(link.permission_id); return acc; }, {})
    };
  },

  updateMatrix: function (ctx, roleId, permissionCodes, requestMeta) {
    GF_RbacService.require(ctx, 'platform.roles.manage');
    const platform = GF_Repository.getPlatformSpreadsheet();
    const role = GF_Repository.findOne(platform, GF_PLATFORM_SHEETS.ROLES, { role_id:roleId, status:'ACTIVE' });
    if (!role || role.scope !== 'TENANT') throw GF_Errors.notFound('Rol tenant no encontrado.', 'ROLE_NOT_FOUND');
    const desiredCodes = GF_Utils.uniqueStrings(permissionCodes).filter(function (code) { return String(code).indexOf('platform.') !== 0; });
    const permissions = GF_Repository.readAll(platform, GF_PLATFORM_SHEETS.PERMISSIONS).filter(function (p) { return p.status === 'ACTIVE'; });
    const byCode = {};
    permissions.forEach(function (p) { byCode[p.code]=p; });
    desiredCodes.forEach(function (code) { if (!byCode[code]) throw GF_Errors.badRequest('Permiso desconocido: ' + code, 'PERMISSION_UNKNOWN'); });
    const existing = GF_Repository.findMany(platform, GF_PLATFORM_SHEETS.ROLE_PERMISSIONS, { role_id:roleId });
    const now = GF_Utils.nowIso();
    existing.forEach(function (row) {
      const perm = permissions.find(function (p) { return p.permission_id === row.permission_id; });
      const active = perm && desiredCodes.indexOf(String(perm.code)) >= 0;
      const next = active ? 'ACTIVE' : 'INACTIVE';
      if (String(row.status || 'ACTIVE') !== next) GF_Repository.updateByField(platform, GF_PLATFORM_SHEETS.ROLE_PERMISSIONS, 'role_permission_id', row.role_permission_id, { status:next, updated_by:ctx.userId, updated_at:now, version:Number(row.version || 1)+1 });
    });
    desiredCodes.forEach(function (code) {
      const permission = byCode[code];
      const existingLink = existing.find(function (row) { return row.permission_id === permission.permission_id; });
      if (!existingLink) GF_Repository.append(platform, GF_PLATFORM_SHEETS.ROLE_PERMISSIONS, { role_permission_id:GF_Utils.uuid('rp'), role_id:roleId, permission_id:permission.permission_id, status:'ACTIVE', created_by:ctx.userId, created_at:now, updated_by:ctx.userId, updated_at:now, version:1 });
    });
    GF_RbacService.bumpVersion();
    GF_SessionService.revokeUsingRole(roleId);
    GF_AuditService.recordPlatform(ctx, { module:'security', action:'role.permissions.update', entity:'Role', recordId:roleId, after:{ permissionCodes:desiredCodes }, correlationId:requestMeta && requestMeta.correlationId });
    return this.matrix(ctx);
  },

  validateTenantRoles_: function (roleIds) {
    if (!(roleIds || []).length) throw GF_Errors.badRequest('Debes asignar al menos un rol.', 'ROLE_REQUIRED');
    const platform = GF_Repository.getPlatformSpreadsheet();
    const roles = GF_Repository.readAll(platform, GF_PLATFORM_SHEETS.ROLES);
    roleIds.forEach(function (roleId) {
      const role = roles.find(function (r) { return r.role_id === roleId && r.scope === 'TENANT' && r.status === 'ACTIVE'; });
      if (!role) throw GF_Errors.badRequest('Rol no permitido: ' + roleId, 'ROLE_INVALID');
    });
    return true;
  }
});
