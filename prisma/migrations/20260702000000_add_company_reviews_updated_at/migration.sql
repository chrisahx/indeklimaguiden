alter table company_reviews
add column if not exists updated_at timestamptz not null default now();
