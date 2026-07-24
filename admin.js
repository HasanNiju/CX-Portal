const { getRedis } = require('./_redis');

const KEY = 'pathao:admin_pass';
const DEFAULT_ADMIN_PASS = '1234';

module.exports = async function handler(req, res) {
  let redis;
  try {
    redis = getRedis();
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const { action, password } = body;

    if (action === 'verify') {
      if (typeof password !== 'string') {
        res.status(400).json({ error: 'password is required' });
        return;
      }
      const stored = (await redis.get(KEY)) || DEFAULT_ADMIN_PASS;
      res.status(200).json({ ok: password === stored });
      return;
    }

    if (action === 'set') {
      if (typeof password !== 'string' || password.length < 4) {
        res.status(400).json({ error: 'password must be at least 4 characters' });
        return;
      }
      await redis.set(KEY, password);
      res.status(200).json({ ok: true });
      return;
    }

    res.status(400).json({ error: "action must be 'verify' or 'set'" });
  } catch (err) {
    res.status(500).json({ error: 'Redis error', detail: String(err.message || err) });
  }
};
