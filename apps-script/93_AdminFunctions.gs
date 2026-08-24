/** Funciones manuales de diagnóstico/operación seguras para ejecutar desde el editor Apps Script. */
function getGymFlowSetupStatus() {
  const props=PropertiesService.getScriptProperties();
  const platformId=props.getProperty(GF_CONFIG.PLATFORM_PROP);
  const folderId=props.getProperty(GF_CONFIG.DATA_FOLDER_PROP);
  let tenants=0;
  let migrations=[];
  if (platformId) {
    const platform=SpreadsheetApp.openById(platformId);
    tenants=GF_Repository.readAll(platform,GF_PLATFORM_SHEETS.TENANTS).length;
    migrations=GF_Repository.readAll(platform,GF_PLATFORM_SHEETS.MIGRATIONS).map(function(r){return r.migration_id;});
  }
  const result={
    ok:Boolean(platformId && folderId), apiVersion:GF_CONFIG.API_VERSION, platformSpreadsheetId:platformId || null, dataFolderId:folderId || null,
    tenants:tenants, demoMode:GF_AuthService.isDemoMode(), firebaseEnabled:GF_FirebaseAuthService.isEnabled(),
    firebaseProjectConfigured:Boolean(props.getProperty(GF_CONFIG.FIREBASE_PROJECT_ID_PROP)), firebaseApiKeyConfigured:Boolean(props.getProperty(GF_CONFIG.FIREBASE_API_KEY_PROP)), migrations:migrations
  };
  Logger.log(JSON.stringify(result,null,2));
  return result;
}

function enableGymFlowDemoLoginForDevelopment() {
  PropertiesService.getScriptProperties().setProperty(GF_CONFIG.DEMO_MODE_PROP,'true');
  return { ok:true, demoMode:true, warning:'Solo desarrollo/demo. Deshabilitar antes de producción.' };
}

function disableGymFlowDemoLogin() {
  PropertiesService.getScriptProperties().setProperty(GF_CONFIG.DEMO_MODE_PROP,'false');
  return { ok:true, demoMode:false };
}

function verifyFirebaseConfiguration() {
  const props=PropertiesService.getScriptProperties();
  const result={
    enabled:GF_FirebaseAuthService.isEnabled(),
    projectIdConfigured:Boolean(props.getProperty(GF_CONFIG.FIREBASE_PROJECT_ID_PROP)),
    apiKeyConfigured:Boolean(props.getProperty(GF_CONFIG.FIREBASE_API_KEY_PROP))
  };
  result.ready=result.enabled && result.projectIdConfigured && result.apiKeyConfigured;
  Logger.log(JSON.stringify(result,null,2));
  return result;
}


function syncPlatformSuperAdminFirebaseIdentity() {
  const props=PropertiesService.getScriptProperties();
  const email=GF_Utils.requireEmail(props.getProperty(GF_CONFIG.PLATFORM_SUPER_ADMIN_EMAIL_PROP),'PLATFORM_SUPER_ADMIN_EMAIL');
  const platform=GF_Repository.getPlatformSpreadsheet();
  const existing=GF_Repository.readAll(platform,GF_PLATFORM_SHEETS.AUTH_IDENTITIES).find(function(row){return row.provider==='firebase' && row.user_id==='usr_platform_superadmin' && !row.tenant_id;});
  const now=GF_Utils.nowIso();
  if(existing){GF_Repository.updateByField(platform,GF_PLATFORM_SHEETS.AUTH_IDENTITIES,'identity_id',existing.identity_id,{email:email,status:'ACTIVE',updated_at:now,version:Number(existing.version||1)+1});}
  else{GF_Repository.append(platform,GF_PLATFORM_SHEETS.AUTH_IDENTITIES,{identity_id:GF_Utils.uuid('identity'),provider:'firebase',provider_uid:'',email:email,user_id:'usr_platform_superadmin',tenant_id:'',branch_id:'',status:'ACTIVE',bound_at:'',created_at:now,updated_at:now,version:1});}
  return {ok:true,email:email,message:'Identidad Super Admin pendiente de primera vinculación Firebase.'};
}
