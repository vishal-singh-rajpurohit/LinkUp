'use strict';

const requiredVars = [
  'MONGO_URI',
  'JWT_SECRET',
];

const missing = requiredVars.filter((key) => !process.env[key]);


if (missing.length > 0) {
  console.error(
    `[config] Missing required environment variables:\n  ${missing.join('\n  ')}\n` +
    `Copy .env.example → .env.dev and fill in the values.`
  );
  process.exit(1);
}

/**
 * Safe parseInt with a default.
 * @param {string|undefined} value
 * @param {number} defaultValue
 */


function parseIntSafe(value, defaultValue) {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : defaultValue;
}

function parseOrigins(raw) {
  if (!raw) return [];
  return raw
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
}

module.exports = Object.freeze({
    ATLAS_LINK: process.env.ATLAS_LINK,
    PORT: parseIntSafe(process.env.PORT, 5000),
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
    ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY || '10d',
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
    REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY || '30d',
    CORS_ORIGIN: parseOrigins(process.env.CORS_ORIGIN),
    CORS_ORIGIN_1: parseOrigins(process.env.CORS_ORIGIN_1),
    CORS_ORIGIN_2: parseOrigins(process.env.CORS_ORIGIN_2),
    CORS_ORIGIN_3: parseOrigins(process.env.CORS_ORIGIN_3),
    CORS_ORIGIN_4: parseOrigins(process.env.CORS_ORIGIN_4),
})
