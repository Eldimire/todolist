'use strict';

const SENSITIVE_KEYS = ['password', 'token', 'authorization', 'jwt'];

function sanitize(arg) {
  if (arg === null || typeof arg !== 'object') {
    return arg;
  }
  const result = { ...arg };
  for (const key of Object.keys(result)) {
    if (SENSITIVE_KEYS.includes(key.toLowerCase())) {
      result[key] = '[REDACTED]';
    }
  }
  return result;
}

const logger = {
  info: (...args) => console.log('[INFO]', ...args.map(sanitize)),
  warn: (...args) => console.warn('[WARN]', ...args.map(sanitize)),
  error: (...args) => console.error('[ERROR]', ...args.map(sanitize)),
  debug: (...args) => console.debug('[DEBUG]', ...args.map(sanitize)),
};

module.exports = logger;
