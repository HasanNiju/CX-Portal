const { getRedis, findRedisEnv, getResolvedEnvNames } = require('./_redis');

// Visit /api/diagnostics in the browser after deploying to see exactly
// what's wrong: which env vars were found, and whether Redis actually
// responds to a real command. No secret values are ever returned.
module.exports = async function handler(req, res) {
  const found = findRedisEnv();
  const relatedKeys = Object.keys(process.env).filter(k => /REDIS|KV_/i.test(k));

  const report = {
    envVarsDetected: found ? { urlKey: found.urlKey, tokenKey: found.tokenKey } : null,
    otherRedisRelatedEnvVarsPresent: relatedKeys,
    redisPingOk: false,
    error: null,
  };

  try {
    const redis = getRedis();
    const testKey = 'pathao:diagnostics_ping';
    await redis.set(testKey, Date.now());
    const value = await redis.get(testKey);
    report.redisPingOk = value !== null && value !== undefined;
    report.resolvedEnvPair = getResolvedEnvNames();
  } catch (err) {
    report.error = String(err.message || err);
  }

  res.status(200).json(report);
};
