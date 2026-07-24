// Shared Upstash Redis client, reused across warm serverless invocations.
//
// Vercel's Redis integrations don't all use the same env var names —
// it depends on which provider/version was connected:
//   - Upstash via Marketplace (standard):      KV_REST_API_URL / KV_REST_API_TOKEN
//   - Upstash native env vars:                 UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN
//   - Custom store name / prefix chosen at setup: <PREFIX>_KV_REST_API_URL / <PREFIX>_KV_REST_API_TOKEN
//     or <PREFIX>_REDIS_REST_URL / <PREFIX>_REDIS_REST_TOKEN
//
// findRedisEnv() checks the known exact names first, then falls back to
// scanning all env vars for any *_REST_API_URL / *_REST_API_TOKEN (or
// *_REDIS_REST_URL / *_REDIS_REST_TOKEN) pair with a matching prefix, so a
// renamed/prefixed integration still gets picked up automatically.
const { Redis } = require('@upstash/redis');

let client = null;
let resolvedFrom = null;

function findRedisEnv() {
  const env = process.env;

  const exactPairs = [
    ['KV_REST_API_URL', 'KV_REST_API_TOKEN'],
    ['UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN'],
    ['REDIS_KV_REST_API_URL', 'REDIS_KV_REST_API_TOKEN'],
  ];
  for (const [urlKey, tokenKey] of exactPairs) {
    if (env[urlKey] && env[tokenKey]) {
      return { url: env[urlKey], token: env[tokenKey], urlKey, tokenKey };
    }
  }

  // Fallback: scan for <PREFIX>_REST_API_URL / <PREFIX>_REST_API_TOKEN or
  // <PREFIX>_REDIS_REST_URL / <PREFIX>_REDIS_REST_TOKEN pairs.
  const urlSuffixes = ['_REST_API_URL', '_REDIS_REST_URL'];
  for (const key of Object.keys(env)) {
    for (const suffix of urlSuffixes) {
      if (key.endsWith(suffix) && env[key]) {
        const prefix = key.slice(0, -suffix.length);
        const tokenSuffix = suffix.replace('URL', 'TOKEN');
        const tokenKey = prefix + tokenSuffix;
        if (env[tokenKey]) {
          return { url: env[key], token: env[tokenKey], urlKey: key, tokenKey };
        }
      }
    }
  }

  return null;
}

function getRedis() {
  if (client) return client;

  const found = findRedisEnv();
  if (!found) {
    const candidates = Object.keys(process.env).filter(k =>
      /REDIS|KV_/i.test(k)
    );
    throw new Error(
      'Redis is not configured: could not find a matching REST URL/TOKEN env var pair. ' +
      (candidates.length
        ? `Found these Redis/KV-related env vars but no complete pair: ${candidates.join(', ')}. `
        : 'No Redis/KV-related env vars found at all — the integration may not be connected to this project/environment. ') +
      'Check Project Settings -> Environment Variables in Vercel, or call /api/diagnostics for details.'
    );
  }

  resolvedFrom = found.urlKey + ' / ' + found.tokenKey;
  client = new Redis({ url: found.url, token: found.token });
  return client;
}

function getResolvedEnvNames() {
  return resolvedFrom;
}

module.exports = { getRedis, findRedisEnv, getResolvedEnvNames };
