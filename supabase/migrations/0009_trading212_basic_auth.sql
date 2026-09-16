-- Trading 212 actually issues an API key + a separate secret and expects
-- HTTP Basic auth (key as username, secret as password) — not a single
-- key sent raw, as 0008 assumed. Store "key:secret" as the one Vault
-- secret per connection (no schema change needed) and do the Basic-auth
-- encoding here, so get_trading212_api_key hands back a ready-to-use
-- Authorization header value and the app never has to know the scheme.
drop function if exists public.get_trading212_api_key(uuid);
drop function if exists public.connect_trading212(uuid, text, text);

create or replace function public.connect_trading212(
  p_account_id uuid,
  p_api_key text,
  p_api_secret text,
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

  v_secret_id := vault.create_secret(p_api_key || ':' || p_api_secret, 'trading212:' || p_account_id::text);

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

create function public.get_trading212_api_key(p_account_id uuid)
returns table (authorization_header text, environment text, connection_id uuid)
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
    select 'Basic ' || encode(convert_to(vs.decrypted_secret, 'utf8'), 'base64'), ic.environment, ic.id
    from public.investment_connections ic
    join vault.decrypted_secrets vs on vs.id = ic.api_key_secret_id
    where ic.account_id = p_account_id;
end;
$$;

revoke all on function public.connect_trading212(uuid, text, text, text) from public;
revoke execute on function public.connect_trading212(uuid, text, text, text) from anon;
grant execute on function public.connect_trading212(uuid, text, text, text) to authenticated;

revoke all on function public.get_trading212_api_key(uuid) from public;
revoke execute on function public.get_trading212_api_key(uuid) from anon;
grant execute on function public.get_trading212_api_key(uuid) to authenticated;
