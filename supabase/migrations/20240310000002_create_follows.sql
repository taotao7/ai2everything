-- 创建关注表
create table public.follows (
    id uuid default gen_random_uuid() primary key,
    follower_id uuid references auth.users(id) on delete cascade not null,
    following_id uuid references auth.users(id) on delete cascade not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(follower_id, following_id)
);

-- 启用RLS
alter table public.follows enable row level security;

-- 创建访问策略
create policy "用户可以查看关注记录"
    on public.follows for select
    using (true);

create policy "用户可以添加关注"
    on public.follows for insert
    with check (auth.uid() = follower_id);

create policy "用户可以取消关注"
    on public.follows for delete
    using (auth.uid() = follower_id);

-- 添加关注数统计列到用户资料表
alter table public.profiles
add column followers_count integer default 0 not null,
add column following_count integer default 0 not null;

-- 创建触发器函数来更新关注数
create or replace function public.handle_follows_count()
returns trigger as $$
begin
    if (TG_OP = 'INSERT') then
        update public.profiles
        set followers_count = followers_count + 1
        where id = NEW.following_id;

        update public.profiles
        set following_count = following_count + 1
        where id = NEW.follower_id;

        return NEW;
    elsif (TG_OP = 'DELETE') then
        update public.profiles
        set followers_count = followers_count - 1
        where id = OLD.following_id;

        update public.profiles
        set following_count = following_count - 1
        where id = OLD.follower_id;

        return OLD;
    end if;
    return null;
end;
$$ language plpgsql security definer;

-- 创建触发器
create trigger on_follow_change
    after insert or delete on public.follows
    for each row execute function public.handle_follows_count(); 