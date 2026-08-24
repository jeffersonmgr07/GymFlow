/** Utilidades puras y helpers de infraestructura. */
const GF_Utils = Object.freeze({
  nowIso: function () { return new Date().toISOString(); },

  uuid: function (prefix) {
    return (prefix ? prefix + '_' : '') + Utilities.getUuid().replace(/-/g, '');
  },

  normalizeEmail: function (value) { return String(value || '').trim().toLowerCase(); },

  normalizeCode: function (value) {
    return String(value || '').trim().toUpperCase().replace(/[^A-Z0-9_-]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 40);
  },

  slugify: function (value) {
    return String(value || '').trim().toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '').slice(0, 64);
  },

  safeJsonParse: function (value, fallback) {
    if (value === null || value === undefined || value === '') return fallback;
    if (typeof value === 'object') return value;
    try { return JSON.parse(value); } catch (_) { return fallback; }
  },

  jsonStringify: function (value) { return JSON.stringify(value === undefined ? null : value); },

  sha256Hex: function (value) {
    const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(value), Utilities.Charset.UTF_8);
    return bytes.map(function (b) {
      const n = b < 0 ? b + 256 : b;
      return ('0' + n.toString(16)).slice(-2);
    }).join('');
  },

  randomToken: function () {
    const raw = Utilities.getUuid() + Utilities.getUuid() + Date.now() + Math.random();
    return Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, raw, Utilities.Charset.UTF_8)).replace(/=+$/g, '') +
      Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, raw + Utilities.getUuid(), Utilities.Charset.UTF_8)).replace(/=+$/g, '');
  },

  addHoursIso: function (iso, hours) {
    const date = new Date(iso);
    date.setTime(date.getTime() + Number(hours || 0) * 60 * 60 * 1000);
    return date.toISOString();
  },

  asBoolean: function (value) {
    return value === true || String(value).toLowerCase() === 'true' || String(value) === '1';
  },

  requireString: function (value, fieldName) {
    const text = String(value || '').trim();
    if (!text) throw GF_Errors.badRequest('Campo requerido: ' + fieldName, 'VALIDATION_REQUIRED');
    return text;
  },

  requireEmail: function (value, fieldName) {
    const email = this.normalizeEmail(this.requireString(value, fieldName || 'email'));
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw GF_Errors.badRequest('Email inválido.', 'VALIDATION_EMAIL');
    return email;
  },

  sanitizeClientLabel: function (value) {
    return String(value || '').replace(/[\r\n\t]/g, ' ').slice(0, 160);
  },

  currency: function (cents, currency) { return { cents: Number(cents || 0), currency: currency || 'PEN' }; },

  pick: function (source, allowed) {
    const out = {};
    (allowed || []).forEach(function (key) {
      if (source && Object.prototype.hasOwnProperty.call(source, key)) out[key] = source[key];
    });
    return out;
  },

  uniqueStrings: function (values) {
    return Array.from(new Set((values || []).map(String).filter(Boolean)));
  }
});
