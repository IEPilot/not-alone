-- Tables are prefixed nam_ so they can safely share a Supabase project with other sites.
-- Run this once in the Supabase SQL editor (Project > SQL Editor > New query > paste > Run).

create extension if not exists pgcrypto;

create table if not exists public.nam_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null default '',
  body text not null default '',
  category text not null default 'Reflections',
  status text not null default 'draft' check (status in ('draft', 'published')),
  featured boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.nam_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text not null default 'site',
  token uuid not null default gen_random_uuid() unique,
  created_at timestamptz not null default now(),
  unsubscribed_at timestamptz
);

create table if not exists public.nam_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null default '',
  email text not null default '',
  message text not null,
  created_at timestamptz not null default now()
);

-- Short anonymous notes for the "Notes from the night" wall. Nothing shows publicly until it is approved.
-- Members of the notes wall: a username and a scrypt password hash, nothing else.
create table if not exists public.nam_members (
  id uuid primary key default gen_random_uuid(),
  username text not null,
  username_lc text not null unique,
  password_hash text not null,
  status text not null default 'active' check (status in ('active', 'blocked')),
  created_at timestamptz not null default now()
);

-- Notes from members go up right away ('approved'). 'pending' notes were held back by the automatic checks
-- and are never shown; 'hidden' notes were reported, hidden, or belong to a blocked member.
create table if not exists public.nam_notes (
  id uuid primary key default gen_random_uuid(),
  body text not null,
  place text not null default '',
  status text not null default 'pending' check (status in ('pending', 'approved', 'hidden')),
  member_id uuid references public.nam_members (id) on delete set null,
  show_name boolean not null default true,
  reports integer not null default 0,
  created_at timestamptz not null default now()
);

-- One report per member per note.
create table if not exists public.nam_note_reports (
  note_id uuid not null references public.nam_notes (id) on delete cascade,
  member_id uuid not null references public.nam_members (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (note_id, member_id)
);

-- The site talks to the database only from the server using the service role key.
-- Turning on row level security with no public policies means the public (anon) key can read or write nothing.
alter table public.nam_posts enable row level security;
alter table public.nam_subscribers enable row level security;
alter table public.nam_messages enable row level security;
alter table public.nam_notes enable row level security;
alter table public.nam_members enable row level security;
alter table public.nam_note_reports enable row level security;

create index if not exists nam_posts_status_published_idx on public.nam_posts (status, published_at desc);

create index if not exists nam_notes_status_created_idx on public.nam_notes (status, created_at desc);
