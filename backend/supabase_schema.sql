-- ============================================
-- EXTENSIONS
-- ============================================
create extension if not exists "uuid-ossp";


-- ============================================
-- TABLE : users (profil lié à auth.users de Supabase)
-- ============================================
create table public.users (
  id            uuid primary key references auth.users(id) on delete cascade,
  username      varchar(255),
  created_at    timestamp with time zone default now(),
  github_access_token text,
  github_username text
);


-- ============================================
-- TABLE : analyses
-- ============================================
create type analysis_status as enum ('pending', 'running', 'completed', 'failed');

create table public.analyses (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.users(id) on delete cascade,
  repo_url    text not null,
  repo_name   varchar(255) not null,
  branch      varchar(255) not null default 'main',
  status      analysis_status not null default 'pending',
  score       smallint check (score >= 0 and score <= 100),
  created_at  timestamp with time zone default now()
);

create index idx_analyses_user_id on public.analyses(user_id);


-- ============================================
-- TABLE : vulnerabilities
-- ============================================
create type vuln_tool     as enum ('npm_audit', 'snyk', 'eslint', 'semgrep');
create type vuln_severity as enum ('critical', 'high', 'medium', 'low', 'info');

create table public.vulnerabilities (
  id              uuid primary key default uuid_generate_v4(),
  analysis_id     uuid not null references public.analyses(id) on delete cascade,
  tool            vuln_tool not null,
  severity        vuln_severity not null,
  title           varchar(500) not null,
  description     text,
  file_path       text,
  line_start      int,
  code_snippet    text,
  recommendation  text,
  raw             jsonb,
  created_at      timestamp with time zone default now()
);

create index idx_vulnerabilities_analysis_id on public.vulnerabilities(analysis_id);
create index idx_vulnerabilities_severity    on public.vulnerabilities(severity);
create index idx_vulnerabilities_tool        on public.vulnerabilities(tool);


-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Users : chaque user ne voit que son propre profil
alter table public.users enable row level security;

create policy "users_select_own" on public.users
  for select using (auth.uid() = id);

create policy "users_insert_own" on public.users
  for insert with check (auth.uid() = id);

create policy "users_update_own" on public.users
  for update using (auth.uid() = id);


-- Analyses : un user ne voit que ses analyses
alter table public.analyses enable row level security;

create policy "analyses_select_own" on public.analyses
  for select using (user_id = auth.uid());

create policy "analyses_insert_own" on public.analyses
  for insert with check (user_id = auth.uid());

create policy "analyses_delete_own" on public.analyses
  for delete using (user_id = auth.uid());


-- Vulnerabilities : accessibles si l'analyse appartient au user
alter table public.vulnerabilities enable row level security;

create policy "vulns_select_own" on public.vulnerabilities
  for select using (
    analysis_id in (
      select id from public.analyses where user_id = auth.uid()
    )
  );

create policy "vulns_insert_own" on public.vulnerabilities
  for insert with check (
    analysis_id in (
      select id from public.analyses where user_id = auth.uid()
    )
  );


-- ============================================
-- VUE : résumé des analyses (pratique pour le dashboard)
-- ============================================
create or replace view public.analyses_summary
  with (security_invoker = true)
as
select
  a.id,
  a.user_id,
  a.repo_name,
  a.repo_url,
  a.branch,
  a.status,
  a.score,
  a.created_at,
  count(v.id)                                            as total_vulns,
  count(v.id) filter (where v.severity = 'critical')    as critical_count,
  count(v.id) filter (where v.severity = 'high')        as high_count,
  count(v.id) filter (where v.severity = 'medium')      as medium_count,
  count(v.id) filter (where v.severity = 'low')         as low_count,
  count(v.id) filter (where v.severity = 'info')        as info_count
from public.analyses a
left join public.vulnerabilities v on v.analysis_id = a.id
group by a.id;
