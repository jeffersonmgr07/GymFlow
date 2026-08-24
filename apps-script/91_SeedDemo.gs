function gfDemoTenantDefinitions_() {
  return [
    {
      tenantId:'tenant_demo_iron_factory', name:'Iron Factory', slug:'iron-factory', themeKey:'iron',
      branches:[
        { branchId:'branch_demo_principal', name:'Sede Principal', code:'PRINCIPAL', address:'Lima, Perú' },
        { branchId:'branch_demo_sur', name:'Sede Sur', code:'SUR', address:'Lima Sur, Perú' }
      ],
      users:[
        { userId:'usr_demo_admin', branchId:'branch_demo_principal', email:'admin@gymflow.demo', name:'Administrador Demo', roleId:'role_gym_owner' },
        { userId:'usr_demo_manager', branchId:'branch_demo_principal', email:'gerente@gymflow.demo', name:'Carla Mendoza', roleId:'role_branch_manager' },
        { userId:'usr_demo_cashier', branchId:'branch_demo_principal', email:'caja@gymflow.demo', name:'Luis Rojas', roleId:'role_reception_cashier' }
      ],
      dashboard:{ activeMembers:486, revenueCents:2842000, checkins:193, expiring:34, debtCents:238000 }
    },
    {
      tenantId:'tenant_demo_ocean_fit', name:'Ocean Fit Club', slug:'ocean-fit-club', themeKey:'ocean',
      branches:[{ branchId:'branch_ocean_main', name:'Sede Costa', code:'COSTA', address:'Lima, Perú' }],
      users:[{ userId:'usr_ocean_owner', branchId:'branch_ocean_main', email:'owner@oceanfit.demo', name:'Valeria Torres', roleId:'role_gym_owner' }],
      dashboard:{ activeMembers:218, revenueCents:1328000, checkins:84, expiring:17, debtCents:91000 }
    }
  ];
}

function gfSeedPlatformCatalogs_(platform) {
  const now = GF_Utils.nowIso();
  const roles = [
    ['role_platform_super_admin','Super Admin SaaS','PLATFORM','Administra plataforma, tenants y matriz base sin acceso automático a datos sensibles.'],
    ['role_support_temp','Soporte SaaS temporal','PLATFORM','Acceso temporal futuro, justificado y auditado.'],
    ['role_gym_owner','Propietario / Administrador','TENANT','Control administrativo del gimnasio.'],
    ['role_branch_manager','Gerente de sede','TENANT','Gestión operativa de una sede.'],
    ['role_reception_cashier','Recepción / Caja','TENANT','Recepción, caja y control de acceso.'],
    ['role_sales','Asesor comercial','TENANT','CRM y ventas.'],
    ['role_trainer','Entrenador','TENANT','Rutinas y seguimiento.'],
    ['role_nutritionist','Nutricionista','TENANT','Nutrición con permisos especiales.'],
    ['role_maintenance','Técnico mantenimiento','TENANT','Equipos e incidencias.'],
    ['role_admin_staff','Personal administrativo','TENANT','Operación administrativa delegada.'],
    ['role_auditor','Auditor','TENANT','Solo lectura y auditoría.'],
    ['role_member','Socio','TENANT','Portal del socio.'],
    ['role_guardian','Tutor','TENANT','Portal de apoderado.']
  ];
  roles.forEach(function (r) {
    gfSystemUpsert_(platform, GF_PLATFORM_SHEETS.ROLES, 'role_id', r[0], { role_id:r[0], name:r[1], scope:r[2], description:r[3], status:'ACTIVE', created_at:now, updated_at:now, version:1 });
  });

  const permissions = [
    ['perm_platform_tenants_read','platform.tenants.read','platform','read','Listar gimnasios de la plataforma.'],
    ['perm_platform_tenants_manage','platform.tenants.manage','platform','manage','Crear, editar, suspender y reactivar gimnasios.'],
    ['perm_platform_roles_read','platform.roles.read','security','read','Consultar roles y matriz base.'],
    ['perm_platform_roles_manage','platform.roles.manage','security','manage','Editar matriz base de permisos.'],
    ['perm_platform_audit_read','platform.audit.read','audit','read','Consultar auditoría técnica de plataforma.'],
    ['perm_tenant_read','tenant.read','tenant','read','Ver configuración pública del tenant actual.'],
    ['perm_branch_read','branch.read','branch','read','Ver sedes del tenant.'],
    ['perm_branch_manage','branch.manage','branch','manage','Crear, editar, suspender y reactivar sedes.'],
    ['perm_user_read','user.read','user','read','Listar usuarios del tenant.'],
    ['perm_user_manage','user.manage','user','manage','Crear, editar, suspender usuarios y asignar roles.'],
    ['perm_role_read','role.read','security','read','Consultar catálogo y matriz de roles del tenant.'],
    ['perm_dashboard_read','dashboard.read','dashboard','read','Ver resumen del dashboard.'],
    ['perm_audit_read','audit.read','audit','read','Consultar auditoría del tenant.'],
    ['perm_settings_read','settings.read','settings','read','Consultar configuración del gimnasio.'],
    ['perm_settings_manage','settings.manage','settings','manage','Administrar configuración y marca blanca.'],
    ['perm_theme_manage','theme.manage','theme','manage','Administrar tema y marca blanca.']
  ];
  permissions.forEach(function (p) {
    gfSystemUpsert_(platform, GF_PLATFORM_SHEETS.PERMISSIONS, 'permission_id', p[0], { permission_id:p[0], code:p[1], module:p[2], action:p[3], description:p[4], status:'ACTIVE', created_at:now, updated_at:now, version:1 });
  });

  const roleMap = {
    role_platform_super_admin:['perm_platform_tenants_read','perm_platform_tenants_manage','perm_platform_roles_read','perm_platform_roles_manage','perm_platform_audit_read'],
    role_gym_owner:['perm_tenant_read','perm_branch_read','perm_branch_manage','perm_user_read','perm_user_manage','perm_role_read','perm_dashboard_read','perm_audit_read','perm_settings_read','perm_settings_manage','perm_theme_manage'],
    role_branch_manager:['perm_tenant_read','perm_branch_read','perm_user_read','perm_role_read','perm_dashboard_read','perm_audit_read','perm_settings_read'],
    role_reception_cashier:['perm_tenant_read','perm_branch_read','perm_dashboard_read'],
    role_sales:['perm_tenant_read','perm_branch_read','perm_dashboard_read'],
    role_trainer:['perm_tenant_read','perm_branch_read'],
    role_nutritionist:['perm_tenant_read','perm_branch_read'],
    role_maintenance:['perm_tenant_read','perm_branch_read'],
    role_admin_staff:['perm_tenant_read','perm_branch_read','perm_user_read','perm_dashboard_read'],
    role_auditor:['perm_tenant_read','perm_branch_read','perm_user_read','perm_role_read','perm_dashboard_read','perm_audit_read','perm_settings_read']
  };
  Object.keys(roleMap).forEach(function (roleId) {
    roleMap[roleId].forEach(function (permissionId) {
      const id = 'rp_' + roleId.replace('role_','') + '_' + permissionId.replace('perm_','');
      const existingLink = GF_Repository.findOne(platform, GF_PLATFORM_SHEETS.ROLE_PERMISSIONS, { role_permission_id:id });
      if (!existingLink) GF_Repository.append(platform, GF_PLATFORM_SHEETS.ROLE_PERMISSIONS, { role_permission_id:id, role_id:roleId, permission_id:permissionId, status:'ACTIVE', created_by:'setup', created_at:now, updated_by:'setup', updated_at:now, version:1 });
      else if (!existingLink.status) GF_Repository.updateByField(platform, GF_PLATFORM_SHEETS.ROLE_PERMISSIONS, 'role_permission_id', id, { status:'ACTIVE', updated_by:'migration_v030', updated_at:now, version:Number(existingLink.version || 1)+1 });
    });
  });
}

function gfSeedTenantCore_(tenantSs, definition) {
  const now = GF_Utils.nowIso();
  definition.branches.forEach(function (branch) {
    if (!GF_Repository.findOne(tenantSs, GF_TENANT_SHEETS.BRANCHES, { branch_id:branch.branchId })) GF_Repository.append(tenantSs, GF_TENANT_SHEETS.BRANCHES, {
      branch_id:branch.branchId, tenant_id:definition.tenantId, name:branch.name, code:branch.code, status:'ACTIVE', timezone:GF_CONFIG.TIME_ZONE, address_text:branch.address, phone:'', email:'',
      created_by:'setup', created_at:now, updated_by:'setup', updated_at:now, version:1
    });
  });
  definition.users.forEach(function (user) {
    if (!GF_Repository.findOne(tenantSs, GF_TENANT_SHEETS.USERS, { user_id:user.userId })) GF_Repository.append(tenantSs, GF_TENANT_SHEETS.USERS, {
      user_id:user.userId, tenant_id:definition.tenantId, branch_id:user.branchId, email:user.email, display_name:user.name, public_name:user.name, status:'ACTIVE', avatar_url:'', auth_provider:'firebase', auth_uid:'', last_login_at:'',
      created_by:'setup', created_at:now, updated_by:'setup', updated_at:now, version:1
    });
    const existingRole = GF_Repository.findMany(tenantSs, GF_TENANT_SHEETS.USER_ROLES, { user_id:user.userId }).find(function (r) { return r.role_id === user.roleId; });
    if (!existingRole) GF_Repository.append(tenantSs, GF_TENANT_SHEETS.USER_ROLES, {
      user_role_id:GF_Utils.uuid('ur'), tenant_id:definition.tenantId, branch_id:user.branchId, user_id:user.userId, role_id:user.roleId, status:'ACTIVE',
      created_by:'setup', created_at:now, updated_by:'setup', updated_at:now, version:1
    });
  });
}

function gfSeedTenantDashboard_(tenantSs, definition) {
  const now = GF_Utils.nowIso();
  definition.branches.forEach(function (branch,index) {
    const id='snap_'+branch.branchId;
    if (GF_Repository.findOne(tenantSs, GF_TENANT_SHEETS.DASHBOARD_SNAPSHOT, { snapshot_id:id })) return;
    const factor=index===0?1:0.42;
    GF_Repository.append(tenantSs, GF_TENANT_SHEETS.DASHBOARD_SNAPSHOT, {
      snapshot_id:id, tenant_id:definition.tenantId, branch_id:branch.branchId, snapshot_date:Utilities.formatDate(new Date(),GF_CONFIG.TIME_ZONE,'yyyy-MM-dd'),
      active_members:Math.round(definition.dashboard.activeMembers*factor), month_revenue_cents:Math.round(definition.dashboard.revenueCents*factor), checkins_today:Math.round(definition.dashboard.checkins*factor),
      expiring_7d:Math.round(definition.dashboard.expiring*factor), debt_cents:Math.round(definition.dashboard.debtCents*factor), currency:'PEN', updated_at:now, version:1
    });
  });
}

function gfSeedDemoIdentities_(platform) {
  const now=GF_Utils.nowIso();
  const identities=[
    { identity_id:'id_demo_superadmin', email:'superadmin@gymflow.demo', user_id:'usr_platform_superadmin', tenant_id:'', branch_id:'', status:'ACTIVE', created_at:now, updated_at:now, version:1 },
    { identity_id:'id_demo_admin', email:'admin@gymflow.demo', user_id:'usr_demo_admin', tenant_id:'tenant_demo_iron_factory', branch_id:'branch_demo_principal', status:'ACTIVE', created_at:now, updated_at:now, version:1 },
    { identity_id:'id_demo_manager', email:'gerente@gymflow.demo', user_id:'usr_demo_manager', tenant_id:'tenant_demo_iron_factory', branch_id:'branch_demo_principal', status:'ACTIVE', created_at:now, updated_at:now, version:1 },
    { identity_id:'id_demo_cashier', email:'caja@gymflow.demo', user_id:'usr_demo_cashier', tenant_id:'tenant_demo_iron_factory', branch_id:'branch_demo_principal', status:'ACTIVE', created_at:now, updated_at:now, version:1 },
    { identity_id:'id_demo_ocean', email:'owner@oceanfit.demo', user_id:'usr_ocean_owner', tenant_id:'tenant_demo_ocean_fit', branch_id:'branch_ocean_main', status:'ACTIVE', created_at:now, updated_at:now, version:1 }
  ];
  identities.forEach(function (identity) { gfSystemUpsert_(platform, GF_PLATFORM_SHEETS.DEMO_IDENTITIES, 'identity_id', identity.identity_id, identity); });
}

function gfSeedPendingAuthIdentitiesFromTenantUsers_(platform) {
  const tenants=GF_Repository.readAll(platform, GF_PLATFORM_SHEETS.TENANTS);
  tenants.forEach(function (tenant) {
    if (!tenant.spreadsheet_id) return;
    let ss; try { ss=SpreadsheetApp.openById(tenant.spreadsheet_id); } catch (_) { return; }
    const users=GF_Repository.readAll(ss, GF_TENANT_SHEETS.USERS);
    users.forEach(function (user) { GF_IdentityService.ensurePendingFirebaseIdentity_(user.email,user.user_id,tenant.tenant_id,user.branch_id,'setup'); });
  });
}

function gfSystemUpsert_(ss, sheetName, idField, idValue, record) {
  const existing=GF_Repository.findOne(ss,sheetName,(function(){const f={};f[idField]=idValue;return f;})());
  if (existing) {
    if (existing.created_at && Object.prototype.hasOwnProperty.call(record,'created_at')) record.created_at=existing.created_at;
    record.version=Number(existing.version || 1)+1;
    GF_Repository.updateByField(ss,sheetName,idField,idValue,record);
  } else GF_Repository.append(ss,sheetName,record);
}
