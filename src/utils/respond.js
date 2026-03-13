function sendOk(res, result, meta) {
  const payload = { ok: true, result };
  if (meta) payload.meta = meta;
  res.json(payload);
}

function sendError(res, status, code, message, details) {
  const payload = { ok: false, error: { code, message } };
  if (details) payload.error.details = details;
  res.status(status).json(payload);
}

module.exports = { sendOk, sendError };
