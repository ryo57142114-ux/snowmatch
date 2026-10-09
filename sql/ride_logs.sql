-- シーズン記録（スノマ＋）：自分の滑走記録を保存する表
-- Supabase の SQL Editor に貼り付けて、1回だけ実行してください。
create table if not exists public.ride_logs (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  ride_date date not null,
  resort text not null,
  weather text,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists ride_logs_user_date
  on public.ride_logs (user_id, ride_date desc);

alter table public.ride_logs enable row level security;

-- 自分の記録だけ、見られる・追加できる・消せる
create policy "ride_logs select own" on public.ride_logs
  for select using (auth.uid() = user_id);
create policy "ride_logs insert own" on public.ride_logs
  for insert with check (auth.uid() = user_id);
create policy "ride_logs delete own" on public.ride_logs
  for delete using (auth.uid() = user_id);
