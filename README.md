# Pathao CX Portal — Redis-backed setup

This adds a small serverless API layer so **presets** and **hub data**
(and the **admin password**) are stored in Redis and shared by every
agent, instead of living in each browser's localStorage. "Pinned" and
"Recent" stay in localStorage per browser — they're personal shortcuts.

## Files added
- `api/_redis.js` — shared Upstash Redis client
- `api/presets.js` — GET / POST `{ presets: [...] }`
- `api/hubs.js` — GET / POST `{ hubs: [...] }`
- `api/admin.js` — POST `{ action: 'verify' | 'set', password }`
- `package.json` — declares the `@upstash/redis` dependency

## Deploy steps
1. Drop these files into your existing repo, alongside `index.html`
   (keep it at the repo root, or wherever Vercel currently serves it
   from — no other changes needed to that file's location).
2. Commit and push. Vercel auto-detects the `api/` folder as
   serverless functions.
3. In the Vercel dashboard, confirm the Upstash Redis integration is
   connected to **this** project, so `KV_REST_API_URL` and
   `KV_REST_API_TOKEN` show up under Project Settings → Environment
   Variables. If they're not there yet, connect the integration from
   the Marketplace tab and redeploy.
4. Redeploy. On first load, the portal seeds Redis with the sample
   hub list automatically (same sample data as before). Custom
   presets start empty until agents add some.

## Troubleshooting "hub data not loading" / "preset not saving"

1. After deploying, open `https://<your-app>.vercel.app/api/diagnostics`
   directly in the browser. It reports (no secrets exposed):
   - `envVarsDetected` — which URL/TOKEN env var pair it found, or `null`
   - `otherRedisRelatedEnvVarsPresent` — any Redis/KV-ish env var names
     it sees, useful if the names don't match what's expected
   - `redisPingOk` — whether an actual write+read against Redis worked
   - `error` — the exact failure message if something's wrong

2. Common causes:
   - **Env vars not on this project/environment.** Vercel integrations
     are connected per-project and per-environment (Production/Preview/
     Development) — check they're enabled for the environment you're
     testing (e.g. Production), not just Preview.
   - **Different var names.** If you renamed the integration or it's a
     different Redis provider, the names might not be `KV_REST_API_URL`
     / `KV_REST_API_TOKEN`. The `otherRedisRelatedEnvVarsPresent` list
     in `/api/diagnostics` will show what's actually there — `_redis.js`
     already tries several known naming patterns automatically, but if
     yours is different, tell me the exact names and I'll add them.
   - **Not redeployed after connecting the integration.** Env vars only
     apply to deployments made after they were added — trigger a new
     deployment (redeploy, don't just "refresh").

3. You can also hit `/api/hubs` or `/api/presets` directly in the
   browser — they now return the real error message in the JSON body
   instead of a generic failure, and the app's toast messages and
   browser console (F12 → Console) show the same detail.

## Notes
- The admin password defaults to `1234` (same as before) until
  someone changes it from the Admin panel — that change now updates
  Redis, so it applies to everyone immediately.
- Everything is "last write wins" — fine for a small internal team
  tool, but two admins editing the same preset at the exact same
  moment could overwrite each other. Not an issue at normal usage.
- If Redis is briefly unreachable, the built-in preset library still
  works (it's hardcoded, not stored), and the UI shows a toast if a
  save or a custom-data load fails.
