-- 1. Sessions Table
create table if not exists copilot_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  title text,
  mode text default 'general', -- 'navigator', 'executor', 'analyst'
  context_data jsonb, -- Snapshot of what user was looking at
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Messages Table
create table if not exists copilot_messages (
  id uuid default uuid_generate_v4() primary key,
  session_id uuid references copilot_sessions on delete cascade not null,
  role text check (role in ('user', 'assistant', 'system')),
  content text,
  meta_data jsonb, -- For "Generative UI" payloads (e.g. { widget: 'BarChart' })
  created_at timestamptz default now()
);

-- 3. RLS Policies
alter table copilot_sessions enable row level security;
alter table copilot_messages enable row level security;

-- Drop existing policies if they exist to avoid errors on re-run
drop policy if exists "Users can view own sessions" on copilot_sessions;
create policy "Users can view own sessions" on copilot_sessions
  for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own sessions" on copilot_sessions;
create policy "Users can insert own sessions" on copilot_sessions
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own sessions" on copilot_sessions;
create policy "Users can update own sessions" on copilot_sessions
  for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own sessions" on copilot_sessions;
create policy "Users can delete own sessions" on copilot_sessions
  for delete using (auth.uid() = user_id);

-- Messages Policies (Linked to Session ownership)
drop policy if exists "Users can view messages of own sessions" on copilot_messages;
create policy "Users can view messages of own sessions" on copilot_messages
  for select using (
    exists (
      select 1 from copilot_sessions
      where id = copilot_messages.session_id
      and user_id = auth.uid()
    )
  );

drop policy if exists "Users can insert messages to own sessions" on copilot_messages;
create policy "Users can insert messages to own sessions" on copilot_messages
  for insert with check (
    exists (
      select 1 from copilot_sessions
      where id = copilot_messages.session_id
      and user_id = auth.uid()
    )
  );
