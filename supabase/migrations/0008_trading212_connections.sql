create table public.investment_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  account_id uuid not null references public.investment_accounts (id) on delete cascade,
  provider text not null check (provider in ('trading212')),
  environment text not null default 'live' check (environment in ('live', 'demo')),
  api_key_secret_id uuid not null references vault.secrets (id) on delete cascade,
  last_synced_at timestamptz,
  last_sync_error text,
  created_at timestamptz not null default now()
);
create unique index investment_connections_account_idx on public.investment_connections (account_id);
select public.apply_owner_policies('investment_connections');

-- All Trading 212 key handling goes through these three security-definer
-- functions so the plaintext key never sits in a normal, RLS-only column.
-- Each one re-checks auth.uid() ownership of the target account itself, so
-- calling with someone else's account_id always fails regardless of role
-- grants below.
create or replace function public.connect_trading212(
  p_account_id uuid,
  p_api_key text,
  p_environment text
) returns uuid
language plpgsql
security definer
set search_path = public, vault
as $$
declare
  v_secret_id uuid;
  v_connection_id uuid;
begin
  if not exists (
    select 1 from public.investment_accounts
    where id = p_account_id and user_id = auth.uid()
  ) then
    raise exception 'Not authorized';
  end if;

  v_secret_id := vault.create_secret(p_api_key, 'trading212:' || p_account_id::text);

  insert into public.investment_connections (user_id, account_id, provider, environment, api_key_secret_id)
  values (auth.uid(), p_account_id, 'trading212', p_environment, v_secret_id)
  on conflict (account_id) do update
    set environment = excluded.environment,
        api_key_secret_id = excluded.api_key_secret_id,
        last_sync_error = null
  returning id into v_connection_id;

  update public.investment_accounts set sync_mode = 'trading212' where id = p_account_id;

  return v_connection_id;
end;
$$;

create or replace function public.get_trading212_api_key(p_account_id uuid)
returns table (api_key text, environment text, connection_id uuid)
language plpgsql
security definer
set search_path = public, vault
as $$
begin
  if not exists (
    select 1 from public.investment_accounts
    where id = p_account_id and user_id = auth.uid()
  ) then
    raise exception 'Not authorized';
  end if;

  return query
    select vs.decrypted_secret, ic.environment, ic.id
    from public.investment_connections ic
    join vault.decrypted_secrets vs on vs.id = ic.api_key_secret_id
    where ic.account_id = p_account_id;
end;
$$;

create or replace function public.disconnect_trading212(p_account_id uuid)
returns void
language plpgsql
security definer
set search_path = public, vault
as $$
declare
  v_secret_id uuid;
begin
  if not exists (
    select 1 from public.investment_accounts
    where id = p_account_id and user_id = auth.uid()
  ) then
    raise exception 'Not authorized';
  end if;

  select api_key_secret_id into v_secret_id from public.investment_connections where account_id = p_account_id;

  delete from public.investment_connections where account_id = p_account_id;
  if v_secret_id is not null then
    delete from vault.secrets where id = v_secret_id;
  end if;

  update public.investment_accounts set sync_mode = 'manual' where id = p_account_id;
end;
$$;

revoke all on function public.connect_trading212(uuid, text, text) from public;
revoke all on function public.get_trading212_api_key(uuid) from public;
revoke all on function public.disconnect_trading212(uuid) from public;
revoke execute on function public.connect_trading212(uuid, text, text) from anon;
revoke execute on function public.get_trading212_api_key(uuid) from anon;
revoke execute on function public.disconnect_trading212(uuid) from anon;
grant execute on function public.connect_trading212(uuid, text, text) to authenticated;
grant execute on function public.get_trading212_api_key(uuid) to authenticated;
grant execute on function public.disconnect_trading212(uuid) to authenticated;
