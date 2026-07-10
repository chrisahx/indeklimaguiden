alter table companies
  add column if not exists claim_email_sent boolean not null default false;
