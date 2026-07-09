create table "installer_leads" (
  "id" uuid primary key default gen_random_uuid(),
  "full_name" text not null,
  "street_address" text not null,
  "postal_code" text not null,
  "city" text not null,
  "email" text not null,
  "phone" text not null,
  "need_type" text not null,
  "message" text not null,
  "selected_companies" jsonb not null,
  "email_status" text not null default 'pending',
  "error_message" text,
  "created_at" timestamptz(6) not null default now()
);

create index "installer_leads_postal_code_idx" on "installer_leads" ("postal_code");
