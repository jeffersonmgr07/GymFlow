const GF_UserService = Object.freeze({
  getByIdForTenant: function (tenantId, userId, anyStatus) {
    const ss = anyStatus ? GF_Repository.getTenantSpreadsheetAnyStatus(tenantId) : GF_Repository.getTenantSpreadsheet(tenantId);
    const row = GF_Repository.findOne(ss, GF_TENANT_SHEETS.USERS, { tenant_id:tenantId, user_id:userId });
    if (!row) return null;
    const result = this.toPublic(row);
    result.roleIds = this.rolesForUser(tenantId, userId, anyStatus);
    return result;
  },

  rolesForUser: function (tenantId, userId, anyStatus) {
    const ss = anyStatus ? GF_Repository.getTenantSpreadsheetAnyStatus(tenantId) : GF_Repository.getTenantSpreadsheet(tenantId);
    return GF_Repository.findMany(ss, GF_TENANT_SHEETS.USER_ROLES, { tenant_id:tenantId, user_id:userId })
      .filter(function (row) { return !row.status || row.status === 'ACTIVE'; })
      .map(function (row) { return row.role_id; });
  },

  list: function (ctx, includeInactive) {
    GF_RbacService.require(ctx, 'user.read');
    if (!ctx.tenantId) throw GF_Errors.forbidden('Contexto tenant requerido.', 'TENANT_CONTEXT_REQUIRED');
    const ss = GF_Repository.getTenantSpreadsheet(ctx.tenantId);
    const roleRows = GF_Repository.findMany(ss, GF_TENANT_SHEETS.USER_ROLES, { tenant_id:ctx.tenantId })
      .filter(function (row) { return !row.status || row.status === 'ACTIVE'; });
    const rolesByUser = roleRows.reduce(function (acc, row) {
      if (!acc[row.user_id]) acc[row.user_id] = [];
      acc[row.user_id].push(row.role_id);
      return acc;
    }, {});
    return GF_Repository.findMany(ss, GF_TENANT_SHEETS.USERS, { tenant_id:ctx.tenantId })
      .filter(function (row) { return includeInactive || row.status === 'ACTIVE'; })
      .map(function (row) {
        const user = GF_UserService.toPublic(row);
        user.roleIds = rolesByUser[row.user_id] || [];
        return user;
      });
  },

  create: function (ctx, payload, requestMeta) {
    GF_RbacService.require(ctx, 'user.manage');
    const ss = GF_Repository.getTenantSpreadsheet(ctx.tenantId);
    const email = GF_Utils.requireEmail(payload && payload.email, 'email');
    if (GF_Repository.findOne(ss, GF_TENANT_SHEETS.USERS, { tenant_id:ctx.tenantId, email:email })) throw GF_Errors.conflict('Ya existe un usuario con ese email en este gimnasio.', 'USER_EMAIL_EXISTS');
    const branchId = GF_Utils.requireString(payload && payload.branchId, 'branchId');
    const branch = GF_BranchService.getById(ctx.tenantId, branchId, false);
    if (!branch || branch.status !== 'ACTIVE') throw GF_Errors.badRequest('La sede seleccionada no está activa.', 'BRANCH_NOT_AVAILABLE');
    const roleIds = GF_Utils.uniqueStrings(payload && payload.roleIds);
    GF_RoleService.validateTenantRoles_(roleIds);
    const now = GF_Utils.nowIso();
    const userId = GF_Utils.uuid('usr');
    const name = GF_Utils.requireString(payload && payload.displayName, 'displayName').slice(0,120);
    const record = {
      user_id:userId, tenant_id:ctx.tenantId, branch_id:branchId, email:email, display_name:name, public_name:String(payload.publicName || name).slice(0,120),
      status:'ACTIVE', avatar_url:String(payload.avatarUrl || '').slice(0,500), auth_provider:'firebase', auth_uid:'', last_login_at:'',
      created_by:ctx.userId, created_at:now, updated_by:ctx.userId, updated_at:now, version:1
    };
    GF_Repository.append(ss, GF_TENANT_SHEETS.USERS, record);
    this.replaceRoles_(ctx, userId, branchId, roleIds, requestMeta);
    GF_IdentityService.ensurePendingFirebaseIdentity_(email, userId, ctx.tenantId, branchId, ctx.userId);
    const out = this.getByIdForTenant(ctx.tenantId, userId);
    GF_AuditService.record(ctx, { module:'users', action:'user.create', entity:'User', recordId:userId, after:out, correlationId:requestMeta && requestMeta.correlationId });
    return out;
  },

  update: function (ctx, userId, payload, requestMeta) {
    GF_RbacService.require(ctx, 'user.manage');
    const ss = GF_Repository.getTenantSpreadsheet(ctx.tenantId);
    const beforeRaw = GF_Repository.findOne(ss, GF_TENANT_SHEETS.USERS, { tenant_id:ctx.tenantId, user_id:userId });
    if (!beforeRaw) throw GF_Errors.notFound('Usuario no encontrado.', 'USER_NOT_FOUND');
    const patch = {};
    if (payload && Object.prototype.hasOwnProperty.call(payload,'displayName')) patch.display_name = GF_Utils.requireString(payload.displayName,'displayName').slice(0,120);
    if (payload && Object.prototype.hasOwnProperty.call(payload,'publicName')) patch.public_name = String(payload.publicName || '').slice(0,120);
    if (payload && Object.prototype.hasOwnProperty.call(payload,'avatarUrl')) patch.avatar_url = String(payload.avatarUrl || '').slice(0,500);
    if (payload && Object.prototype.hasOwnProperty.call(payload,'branchId')) {
      const branch = GF_BranchService.getById(ctx.tenantId, payload.branchId, false);
      if (!branch || branch.status !== 'ACTIVE') throw GF_Errors.badRequest('La sede seleccionada no está activa.', 'BRANCH_NOT_AVAILABLE');
      patch.branch_id = payload.branchId;
    }
    if (payload && Object.prototype.hasOwnProperty.call(payload,'email')) {
      const email = GF_Utils.requireEmail(payload.email,'email');
      const dup = GF_Repository.readAll(ss, GF_TENANT_SHEETS.USERS).find(function (r) { return r.tenant_id === ctx.tenantId && r.email === email && r.user_id !== userId; });
      if (dup) throw GF_Errors.conflict('Ya existe un usuario con ese email.', 'USER_EMAIL_EXISTS');
      patch.email = email;
    }
    patch.updated_by=ctx.userId; patch.updated_at=GF_Utils.nowIso(); patch.version=Number(beforeRaw.version || 1)+1;
    GF_Repository.updateByField(ss, GF_TENANT_SHEETS.USERS, 'user_id', userId, patch);
    const merged = GF_Repository.findOne(ss, GF_TENANT_SHEETS.USERS, { user_id:userId });
    if (patch.email && patch.email !== beforeRaw.email) GF_IdentityService.updatePendingEmail_(ctx.tenantId, userId, patch.email, ctx.userId);
    const rolesChanged = payload && Object.prototype.hasOwnProperty.call(payload,'roleIds');
    if (rolesChanged) this.replaceRoles_(ctx, userId, merged.branch_id, GF_Utils.uniqueStrings(payload.roleIds), requestMeta);
    if (rolesChanged || patch.email || patch.branch_id) GF_SessionService.revokeForUser(ctx.tenantId, userId);
    const after = this.getByIdForTenant(ctx.tenantId, userId);
    GF_AuditService.record(ctx, { module:'users', action:'user.update', entity:'User', recordId:userId, before:this.toPublic(beforeRaw), after:after, correlationId:requestMeta && requestMeta.correlationId });
    return after;
  },

  setStatus: function (ctx, userId, status, requestMeta) {
    GF_RbacService.require(ctx, 'user.manage');
    if (userId === ctx.userId && String(status).toUpperCase() !== 'ACTIVE') throw GF_Errors.conflict('No puedes suspender tu propio usuario durante una sesión activa.', 'SELF_SUSPEND_BLOCKED');
    const next = String(status || '').toUpperCase();
    if (['ACTIVE','SUSPENDED'].indexOf(next) < 0) throw GF_Errors.badRequest('Estado de usuario inválido.', 'USER_STATUS_INVALID');
    const ss = GF_Repository.getTenantSpreadsheet(ctx.tenantId);
    const before = GF_Repository.findOne(ss, GF_TENANT_SHEETS.USERS, { tenant_id:ctx.tenantId, user_id:userId });
    if (!before) throw GF_Errors.notFound('Usuario no encontrado.', 'USER_NOT_FOUND');
    const afterRaw = GF_Repository.updateByField(ss, GF_TENANT_SHEETS.USERS, 'user_id', userId, { status:next, updated_by:ctx.userId, updated_at:GF_Utils.nowIso(), version:Number(before.version || 1)+1 });
    GF_IdentityService.setStatusForUser_(ctx.tenantId, userId, next, ctx.userId);
    if (next !== 'ACTIVE') GF_SessionService.revokeForUser(ctx.tenantId, userId);
    const after = this.toPublic(afterRaw); after.roleIds = this.rolesForUser(ctx.tenantId, userId);
    GF_AuditService.record(ctx, { module:'users', action:next === 'ACTIVE' ? 'user.reactivate' : 'user.suspend', entity:'User', recordId:userId, before:this.toPublic(before), after:after, correlationId:requestMeta && requestMeta.correlationId });
    return after;
  },

  setRoles: function (ctx, userId, roleIds, requestMeta) {
    GF_RbacService.require(ctx, 'user.manage');
    const user = this.getByIdForTenant(ctx.tenantId, userId);
    if (!user) throw GF_Errors.notFound('Usuario no encontrado.', 'USER_NOT_FOUND');
    const roles = GF_Utils.uniqueStrings(roleIds);
    GF_RoleService.validateTenantRoles_(roles);
    this.replaceRoles_(ctx, userId, user.branchId, roles, requestMeta);
    GF_SessionService.revokeForUser(ctx.tenantId, userId);
    return this.getByIdForTenant(ctx.tenantId, userId);
  },

  replaceRoles_: function (ctx, userId, branchId, roleIds, requestMeta) {
    if (!roleIds.length) throw GF_Errors.badRequest('El usuario debe conservar al menos un rol.', 'ROLE_REQUIRED');
    const ss = GF_Repository.getTenantSpreadsheet(ctx.tenantId);
    const now = GF_Utils.nowIso();
    const existing = GF_Repository.findMany(ss, GF_TENANT_SHEETS.USER_ROLES, { tenant_id:ctx.tenantId, user_id:userId });
    existing.forEach(function (row) {
      const shouldActive = roleIds.indexOf(String(row.role_id)) >= 0;
      const next = shouldActive ? 'ACTIVE' : 'INACTIVE';
      if (row.status !== next) GF_Repository.updateByField(ss, GF_TENANT_SHEETS.USER_ROLES, 'user_role_id', row.user_role_id, { status:next, branch_id:branchId, updated_by:ctx.userId, updated_at:now, version:Number(row.version || 1)+1 });
    });
    roleIds.forEach(function (roleId) {
      const row = existing.find(function (r) { return String(r.role_id) === String(roleId); });
      if (!row) GF_Repository.append(ss, GF_TENANT_SHEETS.USER_ROLES, { user_role_id:GF_Utils.uuid('ur'), tenant_id:ctx.tenantId, branch_id:branchId, user_id:userId, role_id:roleId, status:'ACTIVE', created_by:ctx.userId, created_at:now, updated_by:ctx.userId, updated_at:now, version:1 });
    });
    GF_AuditService.record(ctx, { module:'users', action:'user.roles.replace', entity:'User', recordId:userId, after:{ roleIds:roleIds }, correlationId:requestMeta && requestMeta.correlationId });
  },

  toPublic: function (row) {
    return { userId:row.user_id, tenantId:row.tenant_id, branchId:row.branch_id || null, email:row.email, displayName:row.display_name, publicName:row.public_name, status:row.status, avatarUrl:row.avatar_url || '', authProvider:row.auth_provider || '', authBound:Boolean(row.auth_uid), lastLoginAt:row.last_login_at || null };
  }
});
