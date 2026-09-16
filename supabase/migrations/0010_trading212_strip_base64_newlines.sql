-- PostgreSQL's encode(..., 'base64') inserts a newline every 76 characters
-- for long input (MIME-style wrapping) — unlike most base64 encoders. The
-- combined "api_key:api_secret" string is long enough to trigger this, and
-- the embedded newline made the resulting "Basic <base64>" value an invalid
-- HTTP header (fetch()/Headers reject control characters in header values).
-- Strip CR/LF from the encoded output before returning it.
create or replace function public.get_trading212_api_key(p_account_id uuid)
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
    select
      'Basic ' || replace(replace(encode(convert_to(vs.decrypted_secret, 'utf8'), 'base64'), E'\n', ''), E'\r', ''),
      ic.environment,
      ic.id
    from public.investment_connections ic
    join vault.decrypted_secrets vs on vs.id = ic.api_key_secret_id
    where ic.account_id = p_account_id;
end;
$$;
