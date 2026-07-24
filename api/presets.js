const { getRedis } = require('../lib/redis');

const KEY = 'pathao:custom_presets';

module.exports = async function handler(req, res) {
  let redis;
  try {
    redis = getRedis();
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
    return;
  }

  try {
    if (req.method === 'GET') {
      const data = await redis.get(KEY);
      res.status(200).json({ presets: Array.isArray(data) ? data : [] });
      return;
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      const presets = body.presets;
      if (!Array.isArray(presets)) {
        res.status(400).json({ error: 'Body must be { presets: [...] }' });
        return;
      }
      await redis.set(KEY, presets);
      res.status(200).json({ ok: true, count: presets.length });
      return;
    }

    res.setHeader('Allow', 'GET, POST, PUT');
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    res.status(500).json({ error: 'Redis error', detail: String(err.message || err) });
  }
};
