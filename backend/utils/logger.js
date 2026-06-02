/**
 * Simple structured namespace logger utility
 */
const logger = {
  info: (namespace, message, data = '') => {
    console.log(`[${new Date().toISOString()}] [INFO] [${namespace}] ${message}`, data);
  },
  warn: (namespace, message, data = '') => {
    console.warn(`[${new Date().toISOString()}] [WARN] [${namespace}] ⚠️ ${message}`, data);
  },
  error: (namespace, message, error = '') => {
    console.error(`[${new Date().toISOString()}] [ERROR] [${namespace}] ❌ ${message}`, error);
  },
  debug: (namespace, message, data = '') => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[${new Date().toISOString()}] [DEBUG] [${namespace}] 🔧 ${message}`, data);
    }
  }
};

module.exports = logger;
