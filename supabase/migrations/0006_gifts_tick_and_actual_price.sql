alter table public.gift_ideas add column actual_price numeric(10, 2);

alter table public.gift_ideas drop constraint gift_ideas_status_check;
alter table public.gift_ideas alter column status set default 'idea';
alter table public.gift_ideas add constraint gift_ideas_status_check check (status in ('idea', 'purchased'));
