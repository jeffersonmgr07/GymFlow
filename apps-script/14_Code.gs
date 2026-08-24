/** Entradas del Web App. */
function doGet(e) {
  const action = e && e.parameter && e.parameter.action ? e.parameter.action : 'system.health';
  return GF_Response.textOutput(GF_Router.handle({ action: action, payload: {} }, e));
}

function doPost(e) {
  let envelope = {};
  try {
    envelope = GF_Utils.safeJsonParse(e && e.postData ? e.postData.contents : '', {});
  } catch (_) {
    envelope = {};
  }
  return GF_Response.textOutput(GF_Router.handle(envelope, e));
}
