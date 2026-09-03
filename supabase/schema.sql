-- ============================================================
-- CX Portal — Supabase schema, RLS policies, and seed data
-- Run this once in the Supabase SQL editor for a new project.
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- profiles ----------
create type user_role as enum ('agent', 'admin', 'super_admin');
create type user_status as enum ('active', 'disabled', 'pending');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  role user_role not null default 'agent',
  status user_status not null default 'pending',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_login_at timestamptz
);

-- ---------- preset_categories ----------
create table preset_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  icon text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- presets ----------
create table presets (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references preset_categories(id) on delete set null,
  title text not null,
  short_description text,
  content text not null,
  language text not null default 'bn' check (language in ('bn', 'en')),
  tags text[] not null default '{}',
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_by uuid references profiles(id),
  updated_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index presets_search_idx on presets using gin (
  to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(short_description,'') || ' ' || coalesce(content,''))
);

-- ---------- calculator_configs ----------
create table calculator_configs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  config_json jsonb not null,
  is_active boolean not null default true,
  version int not null default 1,
  updated_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- audit_logs ----------
create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references profiles(id),
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- ---------- updated_at trigger ----------
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_profiles_updated before update on profiles for each row execute function set_updated_at();
create trigger trg_categories_updated before update on preset_categories for each row execute function set_updated_at();
create trigger trg_presets_updated before update on presets for each row execute function set_updated_at();
create trigger trg_calc_updated before update on calculator_configs for each row execute function set_updated_at();

-- ============================================================
-- Helper: current user's role, without recursive RLS lookups
-- ============================================================
create or replace function current_role_v() returns user_role
language sql security definer stable as $$
  select role from profiles where id = auth.uid();
$$;

create or replace function is_admin_or_above() returns boolean
language sql security definer stable as $$
  select coalesce((select role in ('admin','super_admin') from profiles where id = auth.uid()), false);
$$;

create or replace function is_super_admin() returns boolean
language sql security definer stable as $$
  select coalesce((select role = 'super_admin' from profiles where id = auth.uid()), false);
$$;

-- ============================================================
-- RLS
-- ============================================================
alter table profiles enable row level security;
alter table preset_categories enable row level security;
alter table presets enable row level security;
alter table calculator_configs enable row level security;
alter table audit_logs enable row level security;

-- profiles: everyone can read their own row; admins can read all;
-- only admins/super_admins can read the roster. No client-side
-- inserts — accounts are created via the service-role API route.
create policy "read own profile" on profiles for select using (auth.uid() = id);
create policy "admins read all profiles" on profiles for select using (is_admin_or_above());
create policy "user updates own basic profile" on profiles for update using (auth.uid() = id)
  with check (auth.uid() = id and role = (select role from profiles p where p.id = auth.uid()));
create policy "admins update profiles" on profiles for update using (is_admin_or_above());

-- preset_categories: any authenticated user can read active categories;
-- only admin+ can write.
create policy "read active categories" on preset_categories for select
  using (is_active or is_admin_or_above());
create policy "admins manage categories" on preset_categories for all
  using (is_admin_or_above()) with check (is_admin_or_above());

-- presets: any authenticated user can read active presets;
-- only admin+ can write. Admins can also see inactive/archived ones.
create policy "read active presets" on presets for select
  using (is_active or is_admin_or_above());
create policy "admins manage presets" on presets for all
  using (is_admin_or_above()) with check (is_admin_or_above());

-- calculator_configs: any authenticated user can read the active config;
-- only admin+ can write (final admin-vs-super-admin split can be
-- tightened here once confirmed — currently both can edit).
create policy "read active calculator config" on calculator_configs for select
  using (is_active or is_admin_or_above());
create policy "admins manage calculator config" on calculator_configs for all
  using (is_admin_or_above()) with check (is_admin_or_above());

-- audit_logs: admin+ can read; inserts happen via service role from
-- the server route handlers that perform privileged actions.
create policy "admins read audit log" on audit_logs for select using (is_admin_or_above());

-- ============================================================
-- Seed: preset categories + presets (migrated from the old
-- Redis-backed preset bank)
-- ============================================================
insert into preset_categories (name, sort_order) values
  ('Basic Preset', 0),
  ('Interested to Join', 1);

insert into presets (category_id, title, short_description, content, language, sort_order)
select c.id, v.title, v.short, v.content, 'bn', v.ord
from preset_categories c, (values
  ('Apology', 'Apology — sincere', 'আন্তরিকভাবে ক্ষমা চাচ্ছি। আমাদের গ্রাহকদের এ ধরনের অভিজ্ঞতা কখনোই কাম্য নয়।', 0),
  ('Apology', 'Apology — situation', 'আমি বুঝতে পারছি এই পরিস্থিতিটি আপনার জন্য খুবই হতাশাজনক। আমি সর্বাত্মক চেষ্টা করছি আপনার সমস্যাটির সমাধান করার জন্য।', 1),
  ('Issue Forward', 'Escalated to department', 'আপনার সমস্যাটির বিষয়ে আমাদের সংশ্লিষ্ট বিভাগে জানিয়ে দেয়া হয়েছে। আশা করছি খুব দ্রুত সময়ের মধ্যে সমস্যাটির সমাধান হয়ে যাবে। দয়া করে ধৈর্য্য ধরে অপেক্ষা করবেন।', 2),
  ('Issue Forward', 'Escalated — high priority', 'আমরা উক্ত বিষয়টি সর্বোচ্চ গুরুত্বের সাথে আমাদের সংশ্লিষ্ট বিভাগে জানিয়ে দিয়েছি। আশা করছি এই বিষয়ে যথাযথ সমাধান খুবই দ্রুত প্রদান করা হবে।', 3),
  ('Acknowledgement', 'Feedback valued', 'আমাদের সবসময়ের লক্ষ্য আমাদের গ্রাহকদের সর্বোচ্চ দ্রুততার সাথে ভালো একটি অভিজ্ঞতা উপহার দেয়া। আপনার মতামত আমাদের লক্ষ্য অর্জনে অত্যন্ত গুরুত্বপূর্ণ।', 4),
  ('Acknowledgement', 'Feedback noted', 'আপনার মতামতটি আমাদের সেবার উন্নতির জন্য অতীব গুরুত্বপূর্ণ। আমি আপনার মতামতটি লিখিতভাবে নোট করে নিয়েছি এবং আমাদের নির্দিষ্ট বিভাগে মতামতটি প্রেরণ করছি।', 5),
  ('Mistake', 'Sent in error', 'পূর্বের মেসেজটির জন্য দুঃখিত। মেসেজটি ভুলক্রমে প্রেরণ হয়েছে। দয়া করে ক্ষমা করবেন এবং মেসেজটি এড়িয়ে যাবেন।', 6),
  ('Hold', 'Please allow time', 'অনুগ্রহ করে আমাকে কিছুটা সময় প্রদান করুন, আমি এ বিষয়টি নিয়ে কাজ করছি।', 7),
  ('Hold', 'Working on it', 'আমি আপনার কাজটিই করছি, অনুগ্রহ করে সময় দিয়ে সাথে থাকুন।', 8),
  ('Hold', 'Sorry for the wait', 'দুঃখিত আপনাকে অপেক্ষায় রাখার জন্য, আপনার কাজটি করার জন্য কিছুটা বেশি সময় প্রয়োজন হচ্ছে।', 9),
  ('Active End Greeting', 'Closing — resolved', 'আশা করছি আমি আপনার সকল প্রশ্নের উত্তর দিতে পেরেছি। পাঠাও লাইভ চ্যাটে যোগাযোগ করার জন্য ধন্যবাদ। পরবর্তীতে যেকোনো সহযোগিতার জন্য পুনরায় যোগাযোগ করুন। ভালো থাকুন।', 10),
  ('InActive End Greeting', 'Closing — inactive', 'সম্ভবত এই মূহুর্তে আপনি লাইভ চ্যাটে অ্যাকটিভ নেই। পরবর্তী যেকোনো সহযোগিতার জন্য পুনরায় যোগাযোগ করুন। পাঠাও এর সাথে থাকার জন্য ধন্যবাদ, ভালো থাকুন।', 11),
  ('Irrelevant Chat', 'Redirect to service topic', 'অনুগ্রহ করে সার্ভিস সংক্রান্ত বিষয়ে জিজ্ঞাসা করুন, আমি আপনাকে সর্বাত্মক সহযোগিতা করার চেষ্টা করবো।', 12),
  ('Irrelevant Chat', 'Second request', 'দুঃখিত স্যার, আমি আবারো অনুরোধ করছি সার্ভিস সংক্রান্ত বিষয়ে জিজ্ঞাসা করার জন্য। অন্যথায় আমার পক্ষ থেকে আপনাকে সহায়তা প্রদান করা সম্ভব হবে না।', 13),
  ('Irrelevant Chat', 'Closing — off topic', 'দুঃখিত, সার্ভিস সংক্রান্ত জিজ্ঞাসা না হওয়ার কারণে লাইভ চ্যাটটি এখানেই শেষ করছি। পাঠাও এর সাথে থাকার জন্য ধন্যবাদ, ভালো থাকুন।', 14),
  ('Hotline Number', 'Hotline', 'ধন্যবাদ অনুসন্ধানের জন্য। আপনার কুরিয়ার সংক্রান্ত যেকোনো জিজ্ঞাসা বা অভিযোগের জন্য ডায়াল করুন: 09610003030 (২৪/৭)', 15),
  ('Basic Troubleshoot', 'App troubleshoot steps', E'আমি আপনাকে অনুরোধ করব একের পর এক এই পদক্ষেপগুলি অনুসরণ করার জন্য:\n\n১. পাঠাও অ্যাপের ক্যাশ ডেটা ক্লিয়ার করুন।\n২. পাঠাও অ্যাপ আনইনস্টল করুন।\n৩. আপনার ডিভাইস পুনরায় স্টার্ট করুন।\n৪. পাঠাও অ্যাপের আপডেট করা ভার্শনটি ইনস্টল করুন।\n\nআশা করছি দ্রুত সমস্যার সমাধান হবে।', 16)
) as v(title, short, content, ord)
where c.name = 'Basic Preset';

insert into presets (category_id, title, short_description, content, language, sort_order)
select c.id, v.title, v.short, v.content, 'bn', v.ord
from preset_categories c, (values
  ('Merchant Registration', 'How to register as a merchant', E'মার্চেন্ট হিসেবে যুক্ত হতে নিচের ধাপগুলো অনুসরণ করুন —\n\n১ম ধাপ: নিচের যেকোনো একটিতে রেজিস্ট্রেশন করুন:\n• ওয়েবসাইট: https://merchant.pathao.com\n• Android: Play Store থেকে Pathao Merchant ডাউনলোড করুন\n• iOS: App Store থেকে Pathao Merchant ডাউনলোড করুন\n\n২য় ধাপ: Sign Up বাটনে ক্লিক করুন।\n\n৩য় ধাপ: নিচের তথ্যগুলো পূরণ করুন:\n• Company Name\n• Owner''s Name\n• Mobile Number (নতুন)\n• Email Address (নতুন)\n• Password\n\n৪র্থ ধাপ: Confirm বাটনে ক্লিক করুন।', 0),
  ('Merchant Store Setup', 'Store setup after registration', E'রেজিস্ট্রেশনের পর Dashboard থেকে নিচের ধাপগুলো অনুসরণ করুন:\n\n১ম ধাপ: ''Verify your mobile number'' পপ-আপে Verify Now ক্লিক করুন।\n\n২য় ধাপ: Store তৈরিতে নিচের তথ্য দিন:\n• Store Name\n• Contact Person''s Name\n• Owner Number (OTP-র জন্য)\n• Primary Contact / IP Number\n• Store Full Address ও সঠিক Area\n• Product Type\n\n৩য় ধাপ: Create Store বাটনে ক্লিক করুন।\n\n৪র্থ ধাপ: Payment Method যোগ করুন।\n\nভিডিও টিউটোরিয়াল: https://youtu.be/AeKsvNzF0uE\n\nআপনার একাউন্ট এখন ডেলিভারির জন্য প্রস্তুত!', 1)
) as v(title, short, content, ord)
where c.name = 'Interested to Join';

-- ============================================================
-- Seed: calculator config — ported 1:1 from the previous
-- hardcoded pricing tables (NEW / OLD / DOC / BOOK / C2C).
-- Weight bands are [<=0.5kg, <=1kg, <=2kg, extra-per-kg-after-2kg].
-- ============================================================
insert into calculator_configs (name, is_active, version, config_json) values (
  'Delivery Fee — default',
  true,
  1,
  '{
    "codRate": { "default": 0.01, "docType": 0, "oldIsdIsd": 0.005 },
    "sameDay": { "zonesAllowed": ["ISD-ISD"], "baseUpTo1kg": 120, "extraPerKgAfter1kg": 25 },
    "partialMultiplier": 1.5,
    "returnMultiplier": 0.5,
    "merchantTables": {
      "new":  { "ISD-ISD":[60,70,90,15], "ISD-OSD":[110,130,150,20], "ISD-Suburb":[110,130,150,20], "OSD-OSD-same":[110,130,150,20], "OSD-OSD-diff":[130,150,180,25], "Suburb-Suburb-same":[110,130,150,20], "Suburb-Suburb-diff":[130,150,180,25], "OSD-Suburb":[130,150,180,25] },
      "old":  { "ISD-ISD":[50,60,80,15], "ISD-OSD":[100,120,140,20], "ISD-Suburb":[100,120,140,20], "OSD-OSD-same":[100,120,140,20], "OSD-OSD-diff":[120,140,160,25], "Suburb-Suburb-same":[100,120,140,20], "Suburb-Suburb-diff":[120,140,160,25], "OSD-Suburb":[120,140,160,25] },
      "doc":  { "ISD-ISD":[45,55,70,12], "ISD-OSD":[90,110,130,18], "ISD-Suburb":[90,110,130,18], "OSD-OSD-same":[90,110,130,18], "OSD-OSD-diff":[110,130,155,22], "Suburb-Suburb-same":[90,110,130,18], "Suburb-Suburb-diff":[110,130,155,22], "OSD-Suburb":[110,130,155,22] },
      "book": { "ISD-ISD":[50,60,80,12], "ISD-OSD":[95,115,135,18], "ISD-Suburb":[95,115,135,18], "OSD-OSD-same":[95,115,135,18], "OSD-OSD-diff":[115,135,160,22], "Suburb-Suburb-same":[95,115,135,18], "Suburb-Suburb-diff":[115,135,160,22], "OSD-Suburb":[115,135,160,22] }
    },
    "c2cTable": {
      "home-inside": { "base": 80, "extra": 15 },
      "home-outside": { "base": 120, "extra": 20 },
      "kiosk-inside": { "base": 60, "extra": 15 },
      "kiosk-outside": { "base": 100, "extra": 20 }
    }
  }'::jsonb
);

-- ============================================================
-- Note on first Super Admin:
-- Sign up one user through Supabase Auth (dashboard or the app),
-- then run:
--   update profiles set role = 'super_admin', status = 'active' where email = 'you@company.com';
-- Every account after that is created through the app by an
-- existing Admin/Super Admin via the invite flow.
-- ============================================================

-- ============================================================
-- Assistant preset search — proper ranked full-text search
-- (replaces crude ILIKE keyword matching). Runs as the calling
-- user (no "security definer"), so the existing RLS policy on
-- presets ("read active presets") still governs what it can see.
-- ============================================================
create or replace function search_presets(search_query text, match_count int default 6)
returns table (title text, short_description text, content text, tags text[], rank real)
language sql
stable
as $$
  select p.title, p.short_description, p.content, p.tags,
         ts_rank(
           to_tsvector('simple', coalesce(p.title,'') || ' ' || coalesce(p.short_description,'') || ' ' || coalesce(p.content,'')),
           websearch_to_tsquery('simple', search_query)
         ) as rank
  from presets p
  where p.is_active
    and to_tsvector('simple', coalesce(p.title,'') || ' ' || coalesce(p.short_description,'') || ' ' || coalesce(p.content,''))
        @@ websearch_to_tsquery('simple', search_query)
  order by rank desc
  limit match_count;
$$;

grant execute on function search_presets(text, int) to authenticated;
