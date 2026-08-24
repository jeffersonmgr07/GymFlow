function gfDemoTenantDefinitions_() {
  return [
    {
      tenantId: 'tenant_demo_iron_factory',
      name: 'Iron Factory',
      slug: 'iron-factory',
      themeKey: 'iron',
      branches: [
        { branchId: 'branch_demo_principal', name: 'Sede Principal', code: 'PRINCIPAL', address: 'Lima, Perú' },
        { branchId: 'branch_demo_sur', name: 'Sede Sur', code: 'SUR', address: 'Lima Sur, Perú' }
      ],
      users: [
        { userId: 'usr_demo_admin', branchId: 'branch_demo_principal', email: 'admin@gymflow.demo', name: 'Administrador Demo', roleId: 'role_gym_owner' },
        { userId: 'usr_demo_manager', branchId: 'branch_demo_principal', email: 'gerente@gymflow.demo', name: 'Carla Mendoza', roleId: 'role_branch_manager' },
        { userId: 'usr_demo_cashier', branchId: 'branch_demo_principal', email: 'caja@gymflow.demo', name: 'Luis Rojas', roleId: 'role_reception_cashier' }
      ],
      dashboard: { activeMembers: 486, revenueCents: 2842000, checkins: 193, expiring: 34, debtCents: 238000 }
    },
    {
      tenantId: 'tenant_demo_ocean_fit',
      name: 'Ocean Fit Club',
      slug: 'ocean-fit-club',
      themeKey: 'ocean',
      branches: [
        { branchId: 'branch_ocean_main', name: 'Sede Costa', code: 'COSTA', address: 'Lima, Perú' }
      ],
      users: [
        { userId: 'usr_ocean_owner', branchId: 'branch_ocean_main', email: 'owner@oceanfit.demo', name: 'Valeria Torres', roleId: 'role_gym_owner' }
      ],
      dashboard: { activeMembers: 218, revenueCents: 1328000, checkins: 84, expiring: 17, debtCents: 91000 }
    }
  ];
}

function gfSeedPlatformCatalogs_(platform) {
  const now = GF_Utils.nowIso();
  const roles = [
    ['role_platform_super_admin','Super Admin SaaS','PLATFORM','Administra la plataforma sin acceso automático a datos sensibles.'],
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
    gfUpsertSeed_(platform, GF_PLATFORM_SHEETS.ROLES, 'role_id', r[0], { role_id:r[0], name:r[1], scope:r[2], description:r[3], status:'ACTIVE', created_at:now, updated_at:now, version:1 });
  });

  const permissions = [
    ['perm_platform_tenants_read','platform.tenants.read','platform','read','Listar gimnasios de la plataforma.'],
    ['perm_tenant_read','tenant.read','tenant','read','Ver configuración pública del tenant actual.'],
    ['perm_branch_read','branch.read','branch','read','Ver sedes del tenant.'],
    ['perm_user_read','user.read','user','read','Listar usuarios del tenant.'],
    ['perm_dashboard_read','dashboard.read','dashboard','read','Ver resumen del dashboard.'],
    ['perm_audit_read','audit.read','audit','read','Consultar auditoría.'],
    ['perm_theme_manage','theme.manage','theme','manage','Administrar tema y marca blanca.'],
    ['perm_user_manage','user.manage','user','manage','Administrar usuarios y roles.'],
    ['perm_branch_manage','branch.manage','branch','manage','Administrar sedes.']
  ];
  permissions.forEach(function (p) {
    gfUpsertSeed_(platform, GF_PLATFORM_SHEETS.PERMISSIONS, 'permission_id', p[0], { permission_id:p[0], code:p[1], module:p[2], action:p[3], description:p[4], status:'ACTIVE', created_at:now, updated_at:now, version:1 });
  });

  const roleMap = {
    role_platform_super_admin: ['perm_platform_tenants_read'],
    role_gym_owner: ['perm_tenant_read','perm_branch_read','perm_user_read','perm_dashboard_read','perm_audit_read','perm_theme_manage','perm_user_manage','perm_branch_manage'],
    role_branch_manager: ['perm_tenant_read','perm_branch_read','perm_user_read','perm_dashboard_read','perm_audit_read'],
    role_reception_cashier: ['perm_tenant_read','perm_branch_read','perm_dashboard_read'],
    role_auditor: ['perm_tenant_read','perm_branch_read','perm_dashboard_read','perm_audit_read']
  };
  Object.keys(roleMap).forEach(function (roleId) {
    roleMap[roleId].forEach(function (permissionId) {
      const id = 'rp_' + roleId.replace('role_','') + '_' + permissionId.replace('perm_','');
      gfUpsertSeed_(platform, GF_PLATFORM_SHEETS.ROLE_PERMISSIONS, 'role_permission_id', id, { role_permission_id:id, role_id:roleId, permission_id:permissionId, created_at:now, version:1 });
    });
  });
}

function gfSeedTenantCore_(tenantSs, definition) {
  const now = GF_Utils.nowIso();
  gfUpsertSeed_(tenantSs, GF_TENANT_SHEETS.SETTINGS, 'setting_id', 'setting_brand', {
    setting_id:'setting_brand', tenant_id:definition.tenantId, key:'branding', value_json:JSON.stringify({ name:definition.name, themeKey:definition.themeKey }), is_sensitive:false,
    created_by:'setup', created_at:now, updated_by:'setup', updated_at:now, version:1
  });
  definition.branches.forEach(function (branch) {
    gfUpsertSeed_(tenantSs, GF_TENANT_SHEETS.BRANCHES, 'branch_id', branch.branchId, {
      branch_id:branch.branchId, tenant_id:definition.tenantId, name:branch.name, code:branch.code, status:'ACTIVE', timezone:'America/Lima', address_text:branch.address,
      created_by:'setup', created_at:now, updated_by:'setup', updated_at:now, version:1
    });
  });
  definition.users.forEach(function (user) {
    gfUpsertSeed_(tenantSs, GF_TENANT_SHEETS.USERS, 'user_id', user.userId, {
      user_id:user.userId, tenant_id:definition.tenantId, branch_id:user.branchId, email:user.email, display_name:user.name, public_name:user.name, status:'ACTIVE', avatar_url:'',
      created_by:'setup', created_at:now, updated_by:'setup', updated_at:now, version:1
    });
    const userRoleId = 'ur_' + user.userId + '_' + user.roleId;
    gfUpsertSeed_(tenantSs, GF_TENANT_SHEETS.USER_ROLES, 'user_role_id', userRoleId, {
      user_role_id:userRoleId, tenant_id:definition.tenantId, branch_id:user.branchId, user_id:user.userId, role_id:user.roleId, status:'ACTIVE',
      created_by:'setup', created_at:now, updated_by:'setup', updated_at:now, version:1
    });
  });
}

function gfSeedTenantDashboard_(tenantSs, definition) {
  const now = GF_Utils.nowIso();
  definition.branches.forEach(function (branch, index) {
    const factor = index === 0 ? 1 : 0.42;
    const id = 'snap_' + branch.branchId;
    gfUpsertSeed_(tenantSs, GF_TENANT_SHEETS.DASHBOARD_SNAPSHOT, 'snapshot_id', id, {
      snapshot_id:id,
      tenant_id:definition.tenantId,
      branch_id:branch.branchId,
      snapshot_date:Utilities.formatDate(new Date(), 'America/Lima', 'yyyy-MM-dd'),
      active_members:Math.round(definition.dashboard.activeMembers * factor),
      month_revenue_cents:Math.round(definition.dashboard.revenueCents * factor),
      checkins_today:Math.round(definition.dashboard.checkins * factor),
      expiring_7d:Math.round(definition.dashboard.expiring * factor),
      debt_cents:Math.round(definition.dashboard.debtCents * factor),
      currency:'PEN',
      updated_at:now,
      version:1
    });
  });
}

function gfSeedDemoIdentities_(platform) {
  const now = GF_Utils.nowIso();
  const identities = [
    { identity_id:'id_demo_superadmin', email:'superadmin@gymflow.demo', user_id:'usr_platform_superadmin', tenant_id:'', branch_id:'', status:'ACTIVE', created_at:now, updated_at:now, version:1 },
    { identity_id:'id_demo_admin', email:'admin@gymflow.demo', user_id:'usr_demo_admin', tenant_id:'tenant_demo_iron_factory', branch_id:'branch_demo_principal', status:'ACTIVE', created_at:now, updated_at:now, version:1 },
    { identity_id:'id_demo_manager', email:'gerente@gymflow.demo', user_id:'usr_demo_manager', tenant_id:'tenant_demo_iron_factory', branch_id:'branch_demo_principal', status:'ACTIVE', created_at:now, updated_at:now, version:1 },
    { identity_id:'id_demo_cashier', email:'caja@gymflow.demo', user_id:'usr_demo_cashier', tenant_id:'tenant_demo_iron_factory', branch_id:'branch_demo_principal', status:'ACTIVE', created_at:now, updated_at:now, version:1 },
    { identity_id:'id_demo_ocean', email:'owner@oceanfit.demo', user_id:'usr_ocean_owner', tenant_id:'tenant_demo_ocean_fit', branch_id:'branch_ocean_main', status:'ACTIVE', created_at:now, updated_at:now, version:1 }
  ];
  identities.forEach(function (identity) {
    gfUpsertSeed_(platform, GF_PLATFORM_SHEETS.DEMO_IDENTITIES, 'identity_id', identity.identity_id, identity);
  });
}

function gfUpsertSeed_(ss, sheetName, idField, idValue, record) {
  const existing = GF_Repository.findOne(ss, sheetName, (function () { const f = {}; f[idField] = idValue; return f; })());
  if (existing) {
    if (existing.created_at && Object.prototype.hasOwnProperty.call(record, 'created_at')) record.created_at = existing.created_at;
    GF_Repository.updateByField(ss, sheetName, idField, idValue, record);
  } else {
    GF_Repository.append(ss, sheetName, record);
  }
}
