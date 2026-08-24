/** GymFlow OS — configuración y constantes del backend. */
const GF_CONFIG = Object.freeze({
  APP_NAME: 'GymFlow OS',
  API_VERSION: '0.3.0',
  TIME_ZONE: 'America/Lima',
  SESSION_TTL_HOURS: 8,
  CACHE_TTL_SECONDS: 300,
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE_SIZE: 25,
  PLATFORM_PROP: 'PLATFORM_SPREADSHEET_ID',
  DATA_FOLDER_PROP: 'GYMFLOW_DATA_FOLDER_ID',
  DEMO_MODE_PROP: 'DEMO_MODE',
  FIREBASE_ENABLED_PROP: 'FIREBASE_AUTH_ENABLED',
  FIREBASE_API_KEY_PROP: 'FIREBASE_API_KEY',
  FIREBASE_PROJECT_ID_PROP: 'FIREBASE_PROJECT_ID',
  RBAC_VERSION_PROP: 'RBAC_VERSION',
  PLATFORM_SUPER_ADMIN_EMAIL_PROP: 'PLATFORM_SUPER_ADMIN_EMAIL'
});

const GF_PLATFORM_SHEETS = Object.freeze({
  TENANTS: 'Tenants',
  ROLES: 'Roles',
  PERMISSIONS: 'Permissions',
  ROLE_PERMISSIONS: 'RolePermissions',
  SESSIONS: 'Sessions',
  DEMO_IDENTITIES: 'DemoIdentities',
  AUTH_IDENTITIES: 'AuthIdentities',
  AUDIT_LOGS: 'AuditLogs',
  MIGRATIONS: 'Migrations'
});

const GF_TENANT_SHEETS = Object.freeze({
  SETTINGS: 'TenantSettings',
  BRANCHES: 'Branches',
  USERS: 'Users',
  USER_ROLES: 'UserRoles',
  AUDIT_LOGS: 'AuditLogs',
  DASHBOARD_SNAPSHOT: 'DashboardSnapshot'
});

const GF_PLATFORM_HEADERS = Object.freeze({
  Tenants: ['tenant_id','name','slug','status','spreadsheet_id','theme_key','currency','locale','timezone','plan_key','max_branches','max_active_members','suspended_at','suspended_reason','created_by','created_at','updated_by','updated_at','version'],
  Roles: ['role_id','name','scope','description','status','created_at','updated_at','version'],
  Permissions: ['permission_id','code','module','action','description','status','created_at','updated_at','version'],
  RolePermissions: ['role_permission_id','role_id','permission_id','status','created_by','created_at','updated_by','updated_at','version'],
  Sessions: ['session_id','token_hash','user_id','tenant_id','branch_id','role_ids_json','created_at','expires_at','revoked_at','status','client_label','correlation_id','version'],
  DemoIdentities: ['identity_id','email','user_id','tenant_id','branch_id','status','created_at','updated_at','version'],
  AuthIdentities: ['identity_id','provider','provider_uid','email','user_id','tenant_id','branch_id','status','bound_at','created_at','updated_at','version'],
  AuditLogs: ['audit_id','tenant_id','branch_id','user_id','role_ids_json','module','action','entity','record_id','occurred_at','before_json','after_json','result','reason','correlation_id','version'],
  Migrations: ['migration_id','name','applied_at','checksum','status','version']
});

const GF_TENANT_HEADERS = Object.freeze({
  TenantSettings: ['setting_id','tenant_id','key','value_json','is_sensitive','created_by','created_at','updated_by','updated_at','version'],
  Branches: ['branch_id','tenant_id','name','code','status','timezone','address_text','phone','email','created_by','created_at','updated_by','updated_at','version'],
  Users: ['user_id','tenant_id','branch_id','email','display_name','public_name','status','avatar_url','auth_provider','auth_uid','last_login_at','created_by','created_at','updated_by','updated_at','version'],
  UserRoles: ['user_role_id','tenant_id','branch_id','user_id','role_id','status','created_by','created_at','updated_by','updated_at','version'],
  AuditLogs: ['audit_id','tenant_id','branch_id','user_id','role_ids_json','module','action','entity','record_id','occurred_at','before_json','after_json','result','reason','correlation_id','version'],
  DashboardSnapshot: ['snapshot_id','tenant_id','branch_id','snapshot_date','active_members','month_revenue_cents','checkins_today','expiring_7d','debt_cents','currency','updated_at','version']
});
