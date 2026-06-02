create table if not exists termos_assinados (
  id          uuid        default gen_random_uuid() primary key,
  nome        text        not null,
  cpf         text        not null,
  email       text        not null,
  ip          text,
  assinado_em timestamptz default now() not null
);

alter table termos_assinados enable row level security;
