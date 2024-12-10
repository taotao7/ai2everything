-- 启用存储扩展
create extension if not exists "storage" schema "extensions";

-- 创建存储桶
insert into storage.buckets (id, name, public)
values ('images', 'images', true);

-- 创建存储策略
create policy "公开图片对所有人可见"
  on storage.objects for select
  using ( bucket_id = 'images' );

create policy "已登录用户可以上传图片"
  on storage.objects for insert
  with check (
    bucket_id = 'images'
    and auth.role() = 'authenticated'
  );

create policy "用户可以更新自己的图片"
  on storage.objects for update
  using (
    bucket_id = 'images'
    and auth.uid() = owner
  );

create policy "用户可以删除自己的图片"
  on storage.objects for delete
  using (
    bucket_id = 'images'
    and auth.uid() = owner
  ); 