// Shared Upstash Redis client, reused across warm serverless invocations.
// Requires KV_REST_API_URL and KV_REST_API_TOKEN env vars, which Vercel's
// Upstash Redis marketplace integration sets automatically once connected
// to this project (Project Settings -> Environment Variables).
const { Redis } = require('@upstash/redis');

let client = null;

function getRedis() {
  if (client) return client;

  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    throw new Error(
      'Redis is not configured: missing KV_REST_API_URL / KV_REST_API_TOKEN env vars. ' +
      'Connect the Upstash Redis integration to this Vercel project and redeploy.'
    );
  }

  client = new Redis({ url, token });
  return client;
}

module.exports = { getRedis };
