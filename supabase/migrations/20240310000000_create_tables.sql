-- 创建images表
create table public.images (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    user_id uuid references auth.users(id) on delete cascade not null,
    prompt text not null,
    style text not null,
    url text not null,
    is_public boolean default false not null,
    likes_count integer default 0 not null
);

-- 启用RLS (行级安全)
alter table public.images enable row level security;

-- 创建访问策略
create policy "用户可以查看自己的图片"
    on public.images for select
    using (auth.uid() = user_id);

create policy "公开图片对所有人可见"
    on public.images for select
    using (is_public = true);

create policy "用户可以创建自己的图片"
    on public.images for insert
    with check (auth.uid() = user_id);

create policy "用户可以更新自己的图片"
    on public.images for update
    using (auth.uid() = user_id);

-- 创建likes表
create table public.likes (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    user_id uuid references auth.users(id) on delete cascade not null,
    image_id uuid references public.images(id) on delete cascade not null,
    unique(user_id, image_id)
);

-- 启用RLS
alter table public.likes enable row level security;

-- 创建访问策略
create policy "用户可以查看点赞记录"
    on public.likes for select
    using (true);

create policy "用户可以添加点赞"
    on public.likes for insert
    with check (auth.uid() = user_id);

create policy "用户可以取消点赞"
    on public.likes for delete
    using (auth.uid() = user_id);

-- 创建触发器函数来更新点赞计数
create or replace function public.handle_likes_count()
returns trigger as $$
begin
    if (TG_OP = 'INSERT') then
        update public.images
        set likes_count = likes_count + 1
        where id = NEW.image_id;
        return NEW;
    elsif (TG_OP = 'DELETE') then
        update public.images
        set likes_count = likes_count - 1
        where id = OLD.image_id;
        return OLD;
    end if;
    return null;
end;
$$ language plpgsql security definer;

-- 创建触发器
create trigger on_like_change
    after insert or delete on public.likes
    for each row execute function public.handle_likes_count(); 