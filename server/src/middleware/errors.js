export function notFound(req, res) {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.originalUrl} was not found` });
}

export function errorHandler(error, _req, res, _next) {
  const status = error.status || 500;
  if (status === 500) console.error(error);
  res.status(status).json({ success: false, message: status === 500 ? "Something went wrong" : error.message, ...(error.errors ? { errors: error.errors } : {}) });
}
