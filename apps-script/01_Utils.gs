/** Utilidades puras y helpers de infraestructura. */
const GF_Utils = Object.freeze({
  nowIso: function () {
    return new Date().toISOString();
  },

  uuid: function (prefix) {
    return (prefix ? prefix + '_' : '') + Utilities.getUuid().replace(/-/g, '');
  },

  normalizeEmail: function (value) {
    return String(value || '').trim().toLowerCase();
  },

  safeJsonParse: function (value, fallback) {
    if (value === null || value === undefined || value === '') return fallback;
    if (typeof value === 'object') return value;
    try { return JSON.parse(value); } catch (_) { return fallback; }
  },

  jsonStringify: function (value) {
    return JSON.stringify(value === undefined ? null : value);
  },

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

  sanitizeClientLabel: function (value) {
    return String(value || '').replace(/[\r\n\t]/g, ' ').slice(0, 160);
  },

  currency: function (cents, currency) {
    return { cents: Number(cents || 0), currency: currency || 'PEN' };
  }
});
