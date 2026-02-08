const logger = require('../utils/logger');

/**
 * Request Logger Middleware
 * Logs incoming HTTP requests
 */
function requestLogger(req, res, next) {
  const start = Date.now();

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
    });
  });

  next();
}

module.exports = requestLogger;
