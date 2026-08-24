/** Errores controlados y contrato uniforme de respuesta. */
function GF_AppError(message, code, details) {
  this.name = 'GF_AppError';
  this.message = message || 'Error de aplicación';
  this.code = code || 'APP_ERROR';
  this.details = details || null;
  this.stack = (new Error(this.message)).stack;
}
GF_AppError.prototype = Object.create(Error.prototype);
GF_AppError.prototype.constructor = GF_AppError;

const GF_Errors = Object.freeze({
  badRequest: function (message, code) { return new GF_AppError(message, code || 'BAD_REQUEST'); },
  unauthenticated: function (message, code) { return new GF_AppError(message || 'Sesión requerida.', code || 'UNAUTHENTICATED'); },
  forbidden: function (message, code) { return new GF_AppError(message || 'No tienes permiso para esta operación.', code || 'FORBIDDEN'); },
  notFound: function (message, code) { return new GF_AppError(message || 'Registro no encontrado.', code || 'NOT_FOUND'); },
  conflict: function (message, code) { return new GF_AppError(message || 'La operación entra en conflicto con el estado actual.', code || 'CONFLICT'); }
});

const GF_Response = Object.freeze({
  success: function (data, message, correlationId) {
    return { ok: true, data: data === undefined ? null : data, message: message || 'OK', errorCode: null, correlationId: correlationId || null };
  },

  failure: function (error, correlationId) {
    const controlled = error && error.name === 'GF_AppError';
    return {
      ok: false,
      data: null,
      message: controlled ? error.message : 'Ocurrió un error interno. Usa el identificador de correlación para soporte.',
      errorCode: controlled ? error.code : 'INTERNAL_ERROR',
      correlationId: correlationId || null
    };
  },

  textOutput: function (payload) {
    return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
  }
});
