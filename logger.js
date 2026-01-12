const fs = require("fs");
const path = require("path");

/**
 * Logger - Production-grade logging system
 * Logs to both console and file with rotation
 */
class Logger {
  constructor(logDir = "./logs") {
    this.logDir = logDir;
    this.createLogDir();
    this.levels = {
      ERROR: 0,
      WARN: 1,
      INFO: 2,
      DEBUG: 3,
    };
    this.currentLevel = process.env.LOG_LEVEL || "INFO";
  }

  createLogDir() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  getTimestamp() {
    return new Date().toISOString();
  }

  getLogFile(level) {
    const date = new Date().toISOString().split("T")[0];
    return path.join(this.logDir, `${level.toLowerCase()}-${date}.log`);
  }

  formatMessage(level, message, data = {}) {
    const timestamp = this.getTimestamp();
    const context = Object.keys(data).length ? JSON.stringify(data) : "";
    return `[${timestamp}] [${level}] ${message} ${context}`.trim();
  }

  writeToFile(level, formatted) {
    try {
      const logFile = this.getLogFile(level);
      fs.appendFileSync(logFile, formatted + "\n");
    } catch (err) {
      console.error("Failed to write log:", err);
    }
  }

  log(level, message, data = {}) {
    if (this.levels[level] > this.levels[this.currentLevel]) {
      return;
    }

    const formatted = this.formatMessage(level, message, data);

    // Console output
    const colors = {
      ERROR: "\x1b[31m",
      WARN: "\x1b[33m",
      INFO: "\x1b[36m",
      DEBUG: "\x1b[35m",
    };
    console.log(`${colors[level] || ""}${formatted}\x1b[0m`);

    // File output
    this.writeToFile(level, formatted);
  }

  error(message, data = {}) {
    this.log("ERROR", message, data);
  }

  warn(message, data = {}) {
    this.log("WARN", message, data);
  }

  info(message, data = {}) {
    this.log("INFO", message, data);
  }

  debug(message, data = {}) {
    this.log("DEBUG", message, data);
  }
}

/**
 * Request Logger Middleware
 */
function requestLogger(logger) {
  return (req, res, next) => {
    const start = Date.now();
    const originalSend = res.send;

    res.send = function (data) {
      const duration = Date.now() - start;
      logger.info(`${req.method} ${req.path}`, {
        status: res.statusCode,
        duration: `${duration}ms`,
        user_id: req.user?.id || "anonymous",
      });

      return originalSend.call(this, data);
    };

    next();
  };
}

/**
 * Error Handler Middleware
 */
function errorHandler(logger) {
  return (err, req, res, next) => {
    logger.error(`${req.method} ${req.path}`, {
      error: err.message,
      stack: err.stack,
      user_id: req.user?.id || "anonymous",
    });

    res.status(err.status || 500).json({
      error: process.env.NODE_ENV === "production" 
        ? "Internal server error" 
        : err.message,
    });
  };
}

module.exports = {
  Logger,
  requestLogger,
  errorHandler,
};
