alter table companies
  add column if not exists claimed_by_user_id uuid references users(id) on delete set null,
  add column if not exists claimed_at timestamptz,
  add column if not exists claim_email text,
  add column if not exists terms_accepted_at timestamptz,
  add column if not exists terms_accepted_version text,
  add column if not exists marketing_consent boolean not null default false,
  add column if not exists marketing_consent_at timestamptz;

create index if not exists companies_claimed_by_user_id_idx on companies (claimed_by_user_id);

alter table company_claims
  add column if not exists terms_accepted_at timestamptz,
  add column if not exists terms_accepted_version text,
  add column if not exists marketing_consent boolean not null default false,
  add column if not exists marketing_consent_at timestamptz,
  add column if not exists expires_at timestamptz,
  add column if not exists completed_at timestamptz;

create table if not exists company_claim_tokens (
  id uuid primary key default gen_random_uuid(),
  company_id text not null references companies(id) on delete cascade,
  email text not null,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists company_claim_tokens_company_id_idx on company_claim_tokens (company_id);
create index if not exists company_claim_tokens_email_idx on company_claim_tokens (email);

create table if not exists magic_login_codes (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  code_hash text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  attempt_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists magic_login_codes_email_created_at_idx on magic_login_codes (email, created_at);

create table if not exists user_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists user_sessions_user_id_idx on user_sessions (user_id);
