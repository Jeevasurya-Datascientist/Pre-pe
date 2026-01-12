-- Create a specific table for KYC Verifications
create table if not exists public.kyc_verifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  pan_number text not null,
  aadhar_number text not null,
  dob date,
  gender text,
  document_urls jsonb default '{}'::jsonb,
  status text default 'PENDING' check (status in ('PENDING', 'APPROVED', 'REJECTED')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.kyc_verifications enable row level security;

-- Policies
create policy "Users can view their own KYC" on public.kyc_verifications
  for select using (auth.uid() = user_id);

create policy "Users can insert their own KYC" on public.kyc_verifications
  for insert with check (auth.uid() = user_id);

create policy "Admins can view all KYC" on public.kyc_verifications
  for select using (
    exists (
      select 1 from public.user_roles 
      where user_id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can update KYC status" on public.kyc_verifications
  for update using (
    exists (
      select 1 from public.user_roles 
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- Create bucket for KYC documents if it doesn't exist
insert into storage.buckets (id, name, public) 
values ('kyc-documents', 'kyc-documents', false)
on conflict (id) do nothing;

create policy "Users can upload their own KYC documents" on storage.objects
  for insert with check (
    bucket_id = 'kyc-documents' and
    auth.uid() = owner
  );

create policy "Users can view their own KYC documents" on storage.objects
  for select using (
    bucket_id = 'kyc-documents' and
    auth.uid() = owner
  );
