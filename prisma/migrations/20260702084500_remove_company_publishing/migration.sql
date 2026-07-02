drop index if exists companies_published_idx;

alter table companies
  drop column if exists is_published;

create index if not exists companies_name_idx on companies (name);
