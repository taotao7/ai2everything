-- 创建用户资料表
create table public.profiles (
    id uuid references auth.users(id) on delete cascade primary key,
    username text unique,
    avatar_url text,
    bio text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 启用RLS
alter table public.profiles enable row level security;

-- 创建访问策略
create policy "公开资料对所有人可见"
    on public.profiles for select
    using (true);

create policy "用户可以更新自己的资料"
    on public.profiles for update
    using (auth.uid() = id);

-- 创建触发器函数来自动更新updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql security definer;

-- 创建触发器
create trigger on_profile_update
    before update on public.profiles
    for each row execute function public.handle_updated_at();

-- 创建触发器函数来自动创建用户资料
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id)
    values (new.id);
    return new;
end;
$$ language plpgsql security definer;

-- 创建触发器
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user(); 