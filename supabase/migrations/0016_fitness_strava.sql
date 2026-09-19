-- fitness_sessions: key Strava metrics only, plus a unique external id to
-- prevent double-importing the same activity on re-sync.
alter table public.fitness_sessions
  add column strava_activity_id bigint,
  add column avg_heartrate numeric(5, 1),
  add column elevation_gain_m numeric(7, 1);
create unique index fitness_sessions_strava_activity_idx
  on public.fitness_sessions (strava_activity_id)
  where strava_activity_id is not null;

-- One Strava connection per user. Both OAuth tokens live in a single Vault
-- secret (as JSON) so a token refresh only ever has to touch one row.
create table public.fitness_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  provider text not null check (provider in ('strava')),
  athlete_id bigint,
  tokens_secret_id uuid not null references vault.secrets (id) on delete cascade,
  token_expires_at timestamptz not null,
  last_synced_at timestamptz,
  last_sync_error text,
  created_at timestamptz not null default now()
);
create unique index fitness_connections_user_provider_idx on public.fitness_connections (user_id, provider);
select public.apply_owner_policies('fitness_connections');

create or replace function public.connect_strava(
  p_athlete_id bigint,
  p_access_token text,
  p_refresh_token text,
  p_expires_at timestamptz
) returns uuid
language plpgsql
security definer
set search_path = public, vault
as $$
declare
  v_secret_id uuid;
  v_connection_id uuid;
begin
  v_secret_id := vault.create_secret(
    json_build_object('access_token', p_access_token, 'refresh_token', p_refresh_token)::text,
    'strava:' || auth.uid()::text
  );

  insert into public.fitness_connections (user_id, provider, athlete_id, tokens_secret_id, token_expires_at)
  values (auth.uid(), 'strava', p_athlete_id, v_secret_id, p_expires_at)
  on conflict (user_id, provider) do update
    set athlete_id = excluded.athlete_id,
        tokens_secret_id = excluded.tokens_secret_id,
        token_expires_at = excluded.token_expires_at,
        last_sync_error = null
  returning id into v_connection_id;

  return v_connection_id;
end;
$$;

create or replace function public.get_strava_tokens()
returns table (access_token text, refresh_token text, token_expires_at timestamptz, connection_id uuid)
language plpgsql
security definer
set search_path = public, vault
as $$
begin
  return query
    select
      (vs.decrypted_secret::json ->> 'access_token'),
      (vs.decrypted_secret::json ->> 'refresh_token'),
      fc.token_expires_at,
      fc.id
    from public.fitness_connections fc
    join vault.decrypted_secrets vs on vs.id = fc.tokens_secret_id
    where fc.user_id = auth.uid() and fc.provider = 'strava';
end;
$$;

create or replace function public.update_strava_tokens(
  p_connection_id uuid,
  p_access_token text,
  p_refresh_token text,
  p_expires_at timestamptz
) returns void
language plpgsql
security definer
set search_path = public, vault
as $$
declare
  v_secret_id uuid;
begin
  select tokens_secret_id into v_secret_id
  from public.fitness_connections
  where id = p_connection_id and user_id = auth.uid();

  if v_secret_id is null then
    raise exception 'Not authorized';
  end if;

  perform vault.update_secret(
    v_secret_id,
    json_build_object('access_token', p_access_token, 'refresh_token', p_refresh_token)::text
  );

  update public.fitness_connections
  set token_expires_at = p_expires_at, last_sync_error = null
  where id = p_connection_id;
end;
$$;

create or replace function public.disconnect_strava()
returns void
language plpgsql
security definer
set search_path = public, vault
as $$
declare
  v_secret_id uuid;
begin
  select tokens_secret_id into v_secret_id from public.fitness_connections
  where user_id = auth.uid() and provider = 'strava';

  delete from public.fitness_connections where user_id = auth.uid() and provider = 'strava';
  if v_secret_id is not null then
    delete from vault.secrets where id = v_secret_id;
  end if;
end;
$$;

revoke all on function public.connect_strava(bigint, text, text, timestamptz) from public;
revoke execute on function public.connect_strava(bigint, text, text, timestamptz) from anon;
grant execute on function public.connect_strava(bigint, text, text, timestamptz) to authenticated;

revoke all on function public.get_strava_tokens() from public;
revoke execute on function public.get_strava_tokens() from anon;
grant execute on function public.get_strava_tokens() to authenticated;

revoke all on function public.update_strava_tokens(uuid, text, text, timestamptz) from public;
revoke execute on function public.update_strava_tokens(uuid, text, text, timestamptz) from anon;
grant execute on function public.update_strava_tokens(uuid, text, text, timestamptz) to authenticated;

revoke all on function public.disconnect_strava() from public;
revoke execute on function public.disconnect_strava() from anon;
grant execute on function public.disconnect_strava() to authenticated;
