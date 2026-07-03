alter table company_locations
  add column if not exists opening_hours jsonb not null default '[]'::jsonb;
