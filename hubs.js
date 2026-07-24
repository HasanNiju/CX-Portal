const { getRedis } = require('./_redis');

const KEY = 'pathao:hubs';

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
      // null/undefined means "nothing saved yet" — the client seeds sample
      // data on first load and pushes it back via POST.
      res.status(200).json({ hubs: Array.isArray(data) ? data : null });
      return;
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      const hubs = body.hubs;
      if (!Array.isArray(hubs)) {
        res.status(400).json({ error: 'Body must be { hubs: [...] }' });
        return;
      }
      await redis.set(KEY, hubs);
      res.status(200).json({ ok: true, count: hubs.length });
      return;
    }

    res.setHeader('Allow', 'GET, POST, PUT');
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    res.status(500).json({ error: 'Redis error', detail: String(err.message || err) });
  }
};
