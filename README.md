# CX Portal — v2

Rebuilt on Next.js 14 (App Router, TypeScript) + Supabase. Replaces the previous
Redis-backed static app with a real database, authentication, and role-based
access control.

## What changed from v1

- **Storage:** Redis → Supabase (Postgres + Auth + Row Level Security)
- **Frontend:** static HTML/JS → Next.js with server components, so pages are
  fast and data-driven instead of hardcoded
- **Auth:** none → Supabase Auth with three roles (Agent, Admin, Super Admin),
  enforced both in middleware and in Postgres RLS policies — not just hidden
  UI buttons
- **Calculator:** same pricing logic as before (verified against the old
  `index.html`), now config-driven from `calculator_configs` in Supabase
  instead of hardcoded constants
- **Presets:** same content as before, now editable through an Admin UI
  instead of requiring a code deploy
- **AI Assistant:** new — a chat interface backed by a server-side route so
  the API key never reaches the browser
- **Design:** fully new visual direction — see "Design notes" below

## 1. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL Editor, run the entire contents of `supabase/schema.sql`. This
   creates all tables, RLS policies, and seeds your preset bank + calculator
   pricing config.
3. In **Authentication → Providers**, make sure Email is enabled. Turn off
   public sign-ups if you want accounts to only be created by Admins (this
   app's invite flow handles that regardless).
4. Copy your Project URL, `anon` public key, and `service_role` key from
   **Settings → API**.

## 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=      # server only — never expose to the browser
ANTHROPIC_API_KEY=              # powers the AI Assistant
```

## 3. Create your first Super Admin

The app has no public sign-up — every account is invited by an existing
Admin/Super Admin. To bootstrap the very first one:

1. In the Supabase dashboard, go to **Authentication → Users → Add user**
   and create yourself an account (or sign up through `/login` if you've
   temporarily enabled sign-ups).
2. In the SQL Editor, run:
   ```sql
   insert into profiles (id, full_name, email, role, status)
   values ('<user-id-from-auth>', 'Your Name', 'you@company.com', 'super_admin', 'active');
   ```
   (If a profile row was already created by a trigger, use `update` instead.)
3. Log in — you'll land on `/home`, and the "Admin" link in the top bar will
   take you to the management workspace.

From there, use **Agents & Admins → Add account** to invite everyone else.

## 4. Run it

```bash
npm install
npm run dev
```

## 5. Deploy

This is a standard Next.js app — deploys cleanly to Vercel. Set the same
environment variables in your hosting provider's dashboard.

## Design notes

The visual direction is deliberately not a generic SaaS dashboard template.
Since Pathao is a courier company, the UI borrows from waybills and shipment
tickets: preset cards and the calculator result use a "ticket stub" component
with a perforated top edge and a monospace corner code. The Agent workspace
uses a cool paper-grey palette; the Admin/Super Admin workspace switches to a
deep navy surface, so elevated privilege is felt, not just labeled. Typography
pairs Space Grotesk (display), Inter (UI), and IBM Plex Mono (data — zone
codes, amounts, preset IDs).

## Project structure

```
app/
  (agent)/          Agent-facing pages — home, presets, calculator, assistant
  admin/            Admin & Super Admin management workspace
  api/               Server-only route handlers (assistant, admin actions)
  login/
components/
  ui/               Design-system primitives (Ticket, Button, Badge, Toast…)
  shell/            TopBar, MobileNav
  admin/            Admin-only components (PresetEditor)
lib/
  supabase/         Browser/server/admin Supabase clients + types
  calculator/       Pricing engine (ported from the old app)
  auth/, presets/   Server actions
supabase/
  schema.sql        Full schema, RLS policies, and seed data
```

## Open items (see the PRD's "Open Items" section)

A few product decisions weren't specified and were given reasonable defaults —
worth confirming and adjusting:

- **Calculator config editing:** Admins can currently only edit
  `calculator_configs` directly in Supabase. A proper form UI (with the
  admin-vs-super-admin edit split the PRD flags as undecided) can be added
  once that split is confirmed.
- **Invite flow:** new accounts get a Supabase-generated magic invite link
  (logged server-side) rather than an email being sent automatically — wire
  up Supabase's SMTP settings (or a transactional email provider) to send it.
- **AI Assistant model/provider:** wired to Anthropic's API via
  `ANTHROPIC_API_KEY`. Swap the route in `app/api/assistant/route.ts` if you'd
  rather use a different provider.
