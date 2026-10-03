-- DINOBIRD 서버 설정 — Supabase 대시보드 → SQL Editor 에 전체를 붙여 넣고 RUN 한 번 누르세요.

-- 관리자 판별 (이 이메일로 로그인한 사람만 편집 가능)
create or replace function public.is_admin() returns boolean
language sql stable as $$
  select coalesce(auth.jwt() ->> 'email', '') = 'dinobird.agency@gmail.com'
$$;

-- 1. 사이트 콘텐츠 (아티스트·카테고리·레터·히어로·About)
create table if not exists public.site_content (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.site_content enable row level security;
drop policy if exists "content read" on public.site_content;
drop policy if exists "content write" on public.site_content;
create policy "content read"  on public.site_content for select using (true);
create policy "content write" on public.site_content for all using (public.is_admin()) with check (public.is_admin());

-- 2. Contact 문의
create table if not exists public.inquiries (
  id bigint generated always as identity primary key,
  name text not null default '',
  email text not null default '',
  brief text not null default '',
  status text not null default '신규',
  created_at timestamptz not null default now()
);
alter table public.inquiries enable row level security;
drop policy if exists "inquiry submit" on public.inquiries;
drop policy if exists "inquiry admin read" on public.inquiries;
drop policy if exists "inquiry admin update" on public.inquiries;
create policy "inquiry submit" on public.inquiries for insert
  with check (char_length(name) < 200 and char_length(email) < 200 and char_length(brief) < 5000 and status = '신규');
create policy "inquiry admin read"   on public.inquiries for select using (public.is_admin());
create policy "inquiry admin update" on public.inquiries for update using (public.is_admin()) with check (public.is_admin());

-- 3. 방문 통계
create table if not exists public.page_views (
  id bigint generated always as identity primary key,
  path text not null default '',
  source text not null default 'direct',
  referrer text not null default '',
  device text not null default '',
  session_id text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists page_views_created_idx on public.page_views (created_at);
alter table public.page_views enable row level security;
drop policy if exists "view track" on public.page_views;
drop policy if exists "view admin read" on public.page_views;
create policy "view track"      on public.page_views for insert with check (char_length(path) < 300);
create policy "view admin read" on public.page_views for select using (public.is_admin());

-- 4. 사진·영상 저장소 (공개 읽기, 관리자만 업로드)
insert into storage.buckets (id, name, public) values ('media', 'media', true)
  on conflict (id) do update set public = true;
drop policy if exists "media read" on storage.objects;
drop policy if exists "media admin write" on storage.objects;
drop policy if exists "media admin update" on storage.objects;
drop policy if exists "media admin delete" on storage.objects;
create policy "media read"         on storage.objects for select using (bucket_id = 'media');
create policy "media admin write"  on storage.objects for insert with check (bucket_id = 'media' and public.is_admin());
create policy "media admin update" on storage.objects for update using (bucket_id = 'media' and public.is_admin());
create policy "media admin delete" on storage.objects for delete using (bucket_id = 'media' and public.is_admin());

-- 5. 어드민에서 저장하면 열려 있는 사이트에도 즉시 반영
do $$ begin
  alter publication supabase_realtime add table public.site_content;
exception when duplicate_object then null; end $$;
