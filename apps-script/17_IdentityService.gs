/** Vincula identidades externas (Firebase) con usuarios internos sin guardar contraseñas. */
const GF_IdentityService = Object.freeze({
  ensurePendingFirebaseIdentity_: function (email, userId, tenantId, branchId, actorId) {
    const platform = GF_Repository.getPlatformSpreadsheet();
    const normalized = GF_Utils.normalizeEmail(email);
    const existing = GF_Repository.readAll(platform, GF_PLATFORM_SHEETS.AUTH_IDENTITIES).find(function (row) {
      return row.provider === 'firebase' && row.user_id === userId && row.tenant_id === tenantId;
    });
    const now = GF_Utils.nowIso();
    if (existing) {
      return GF_Repository.updateByField(platform, GF_PLATFORM_SHEETS.AUTH_IDENTITIES, 'identity_id', existing.identity_id, {
        email:normalized, branch_id:branchId || '', status:'ACTIVE', updated_at:now, version:Number(existing.version || 1)+1
      });
    }
    const record = {
      identity_id:GF_Utils.uuid('identity'), provider:'firebase', provider_uid:'', email:normalized, user_id:userId, tenant_id:tenantId || '', branch_id:branchId || '', status:'ACTIVE', bound_at:'', created_at:now, updated_at:now, version:1
    };
    GF_Repository.append(platform, GF_PLATFORM_SHEETS.AUTH_IDENTITIES, record);
    return record;
  },

  updatePendingEmail_: function (tenantId, userId, email, actorId) {
    const platform = GF_Repository.getPlatformSpreadsheet();
    const rows = GF_Repository.readAll(platform, GF_PLATFORM_SHEETS.AUTH_IDENTITIES).filter(function (row) { return row.tenant_id === tenantId && row.user_id === userId && row.provider === 'firebase'; });
    const now = GF_Utils.nowIso();
    rows.forEach(function (row) {
      GF_Repository.updateByField(platform, GF_PLATFORM_SHEETS.AUTH_IDENTITIES, 'identity_id', row.identity_id, { email:GF_Utils.normalizeEmail(email), updated_at:now, version:Number(row.version || 1)+1 });
    });
    return rows.length;
  },

  setStatusForUser_: function (tenantId, userId, status, actorId) {
    const platform = GF_Repository.getPlatformSpreadsheet();
    const now = GF_Utils.nowIso();
    return GF_Repository.updateMany(platform, GF_PLATFORM_SHEETS.AUTH_IDENTITIES, function (row) { return row.tenant_id === tenantId && row.user_id === userId; }, function (row) { return { status:status, updated_at:now, version:Number(row.version || 1)+1 }; });
  },

  resolveFirebaseIdentity_: function (firebaseUser) {
    const platform = GF_Repository.getPlatformSpreadsheet();
    const uid = String(firebaseUser.localId || firebaseUser.uid || '');
    const email = GF_Utils.normalizeEmail(firebaseUser.email || '');
    if (!uid || !email) throw GF_Errors.unauthenticated('La identidad Firebase no contiene uid/email válidos.', 'FIREBASE_IDENTITY_INVALID');
    let identity = GF_Repository.findOne(platform, GF_PLATFORM_SHEETS.AUTH_IDENTITIES, { provider:'firebase', provider_uid:uid, status:'ACTIVE' });
    if (identity) return identity;

    const candidates = GF_Repository.readAll(platform, GF_PLATFORM_SHEETS.AUTH_IDENTITIES).filter(function (row) {
      return row.provider === 'firebase' && row.status === 'ACTIVE' && !row.provider_uid && GF_Utils.normalizeEmail(row.email) === email;
    });
    if (candidates.length !== 1) {
      if (!candidates.length) throw GF_Errors.unauthenticated('Tu cuenta Firebase aún no está vinculada a GymFlow OS.', 'FIREBASE_ACCOUNT_NOT_LINKED');
      throw GF_Errors.conflict('El email coincide con más de una cuenta. Se requiere vinculación administrativa explícita.', 'FIREBASE_IDENTITY_AMBIGUOUS');
    }
    identity = candidates[0];
    const now = GF_Utils.nowIso();
    return GF_Repository.updateByField(platform, GF_PLATFORM_SHEETS.AUTH_IDENTITIES, 'identity_id', identity.identity_id, { provider_uid:uid, bound_at:now, updated_at:now, version:Number(identity.version || 1)+1 });
  }
});
