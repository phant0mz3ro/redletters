create table letters (
  id uuid primary key default gen_random_uuid(),
  author text not null check (author in ('redhead','jughead')),
  body text not null,
  created_at timestamptz not null default now()
);
-- RLS on with no policies: only the server (service role key) can read/write.
alter table letters enable row level security;

grant usage on schema public to service_role;
grant all on table public.letters to service_role;
