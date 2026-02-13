-- ═══════════════════════════════════════════
-- The Listening Room — Supabase Schema
-- ═══════════════════════════════════════════
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- 1. Create the instruments table
create table if not exists instruments (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  maker text not null,
  year text not null default '',
  youtube_url text not null,
  thumbnail_url text,           -- optional custom thumbnail (overrides YT thumbnail)
  tags text[] default '{}',     -- e.g. {'violin', 'contemporary', 'italian'}
  sort_order int default 0,     -- lower = shown first
  enabled boolean default true, -- toggle visibility without deleting
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Auto-update `updated_at` on row changes
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger instruments_updated_at
  before update on instruments
  for each row
  execute function update_updated_at();

-- 3. Row Level Security
alter table instruments enable row level security;

-- Public can read enabled instruments (no auth required)
create policy "Public can read enabled instruments"
  on instruments for select
  using (enabled = true);

-- Authenticated users can do everything (admin panel)
create policy "Authenticated users have full access"
  on instruments for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- 4. Create an index for sorting
create index idx_instruments_sort on instruments (sort_order asc, created_at desc);

-- 5. Seed with initial data
insert into instruments (name, maker, year, youtube_url, sort_order) values
  ('Violin by Marc Paquin, 2026 "Ole Bull"', 'Marc Paquin', '2026', 'https://www.youtube.com/watch?v=O6CeZ8NGBZE', 1),
  ('Violin by Anna Arietti, 2025 Cremona', 'Anna Arietti', '2025', 'https://www.youtube.com/watch?v=O6CeZ8NGBZE', 2),
  ('Violin by Gregg Alf, 2025', 'Gregg Alf', '2025', 'https://www.youtube.com/watch?v=T39W4I-d9zU', 3),
  ('Violin by Mark Jennings, 2025', 'Mark Jennings', '2025', 'https://www.youtube.com/watch?v=T39W4I-d9zU', 4),
  ('Atelier MyLuthier Violin, London 2025 (No. 14)', 'Atelier MyLuthier', '2025', 'https://www.youtube.com/watch?v=Q4J6PdyEJkY', 5),
  ('Violin by Daniele Tonarelli, 2025 Cremona', 'Daniele Tonarelli', '2025', 'https://www.youtube.com/watch?v=VYL2tV62wJA', 6),
  ('Violin by Milena Schmoller, 2025', 'Milena Schmoller', '2025', 'https://www.youtube.com/watch?v=-c6coHuD2sM', 7),
  ('Violin by Ian McWilliams, 2025', 'Ian McWilliams', '2025', 'https://www.youtube.com/watch?v=-c6coHuD2sM', 8),
  ('Violin by Kurt Widenhouse, 2020', 'Kurt Widenhouse', '2020', 'https://www.youtube.com/watch?v=-c6coHuD2sM', 9),
  ('Violin by Dominik Wlk, 2025', 'Dominik Wlk', '2025', 'https://www.youtube.com/watch?v=VYL2tV62wJA', 10),
  ('Atelier MyLuthier Violin, London 2025 (No. 7)', 'Atelier MyLuthier', '2025', 'https://www.youtube.com/watch?v=vu2kMyUuT5Q', 11);
