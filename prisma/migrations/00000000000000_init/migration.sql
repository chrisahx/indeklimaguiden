create extension if not exists pgcrypto;

create table if not exists companies (
  id text primary key,
  slug text not null unique,
  name text not null,
  cvr text unique,
  website text,
  phone text,
  email text,
  status text not null default 'pending',
  is_published boolean not null default false,
  is_claimed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_scraped_at timestamptz
);

create table if not exists company_locations (
  company_id text primary key references companies(id) on delete cascade,
  address text,
  postal_code text,
  city text,
  country text not null default 'Denmark',
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  updated_at timestamptz not null default now()
);

create table if not exists company_sources (
  id uuid primary key default gen_random_uuid(),
  company_id text not null references companies(id) on delete cascade,
  source text not null check (source in ('input', 'google', 'trustpilot', 'manual')),
  source_url text,
  external_id text,
  status text not null default 'pending',
  rating numeric(3, 2),
  review_count integer,
  payload jsonb not null default '{}'::jsonb,
  scraped_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, source)
);

create table if not exists company_reviews (
  id text primary key,
  company_id text not null references companies(id) on delete cascade,
  source text not null check (source in ('google', 'trustpilot')),
  source_url text,
  author text,
  title text,
  body text,
  rating numeric(3, 2),
  rating_label text,
  reviewed_at timestamptz,
  reviewed_at_label text,
  scraped_at timestamptz not null default now(),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists company_photos (
  id uuid primary key default gen_random_uuid(),
  company_id text not null references companies(id) on delete cascade,
  source text not null check (source in ('google', 'trustpilot', 'manual')),
  url text not null,
  alt text,
  position integer not null default 0,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (company_id, source, url)
);

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists company_claims (
  id uuid primary key default gen_random_uuid(),
  company_id text not null references companies(id) on delete cascade,
  user_id uuid references users(id) on delete set null,
  claimant_email text not null,
  claimant_name text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'revoked')),
  verification_method text,
  verification_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  decided_at timestamptz
);

create table if not exists company_edit_requests (
  id uuid primary key default gen_random_uuid(),
  company_id text not null references companies(id) on delete cascade,
  user_id uuid references users(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  requested_changes jsonb not null,
  created_at timestamptz not null default now(),
  decided_at timestamptz
);

create index if not exists companies_published_idx on companies (is_published, name);
create index if not exists companies_cvr_idx on companies (cvr) where cvr is not null;
create index if not exists company_locations_city_idx on company_locations (city);
create index if not exists company_sources_payload_gin_idx on company_sources using gin (payload);
create index if not exists company_reviews_company_source_idx on company_reviews (company_id, source, reviewed_at desc);
create index if not exists company_reviews_rating_idx on company_reviews (rating);
create index if not exists company_claims_company_status_idx on company_claims (company_id, status);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_companies_updated_at on companies;
create trigger set_companies_updated_at
before update on companies
for each row execute function set_updated_at();

drop trigger if exists set_company_locations_updated_at on company_locations;
create trigger set_company_locations_updated_at
before update on company_locations
for each row execute function set_updated_at();

drop trigger if exists set_company_sources_updated_at on company_sources;
create trigger set_company_sources_updated_at
before update on company_sources
for each row execute function set_updated_at();

drop trigger if exists set_company_reviews_updated_at on company_reviews;
create trigger set_company_reviews_updated_at
before update on company_reviews
for each row execute function set_updated_at();

drop trigger if exists set_users_updated_at on users;
create trigger set_users_updated_at
before update on users
for each row execute function set_updated_at();
