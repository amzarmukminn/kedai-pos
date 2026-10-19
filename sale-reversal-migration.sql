-- Migration applied to the POS project; do not run it again on that database.
create table public.sale_reversals (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null unique references public.sales(id) on delete restrict,
  actor_id uuid not null references public.profiles(id) on delete restrict,
  reason text not null check (length(btrim(reason)) between 3 and 1000),
  money_status text not null check (money_status in ('returned', 'not_returned', 'not_applicable')),
  created_at timestamptz not null default now()
);

create table public.sale_reversal_items (
  reversal_id uuid not null references public.sale_reversals(id) on delete restrict,
  sale_item_id uuid not null references public.sale_items(id) on delete restrict,
  returned_quantity integer not null check (returned_quantity >= 0),
  stock_movement_id uuid unique references public.stock_movements(id) on delete restrict,
  primary key (reversal_id, sale_item_id),
  check ((returned_quantity = 0) = (stock_movement_id is null))
);

create index sale_reversals_created_idx on public.sale_reversals(created_at,id);
create index sale_reversals_actor_idx on public.sale_reversals(actor_id);
create index sale_reversal_items_sale_item_idx on public.sale_reversal_items(sale_item_id);
create index sales_completed_at_idx on public.sales(completed_at,id) where status='completed';
create index stock_movements_sale_id_idx on public.stock_movements(sale_id) where sale_id is not null;

alter table public.sale_reversals enable row level security;
alter table public.sale_reversal_items enable row level security;
revoke all on public.sale_reversals, public.sale_reversal_items from public, anon, authenticated;
grant select on public.sale_reversals, public.sale_reversal_items to authenticated;
create policy reversal_read_staff on public.sale_reversals for select to authenticated
  using ((select public.has_role(array['owner','admin','manager','cashier','auditor']::public.app_role[])));
create policy reversal_items_read_staff on public.sale_reversal_items for select to authenticated
  using ((select public.has_role(array['owner','admin','manager','cashier','auditor']::public.app_role[])));

create function public.reverse_sale(p_sale_id uuid, p_reason text, p_money_status text, p_returns jsonb)
returns uuid language plpgsql security definer set search_path = pg_catalog, public
as $$
declare
  v_sale public.sales%rowtype;
  v_line record;
  v_product public.products%rowtype;
  v_return integer;
  v_id uuid := gen_random_uuid();
  v_movement uuid;
begin
  if auth.uid() is null or not public.has_role(array['owner','admin']::public.app_role[]) then
    raise exception 'Only active owners and admins can reverse sales';
  end if;
  if p_reason is null or length(btrim(p_reason)) not between 3 and 1000 then
    raise exception 'A reason of 3 to 1000 characters is required';
  end if;
  if p_money_status is null or p_money_status not in ('returned','not_returned','not_applicable') then
    raise exception 'A money return declaration is required';
  end if;
  if jsonb_typeof(p_returns) is distinct from 'array' then
    raise exception 'Returned quantities must be an array';
  end if;
  select * into v_sale from public.sales where id = p_sale_id for update;
  if not found or v_sale.status <> 'completed' then raise exception 'Sale is unavailable'; end if;
  if exists(select 1 from public.sale_reversals where sale_id = p_sale_id) then
    raise exception 'Sale was already reversed';
  end if;
  -- Reject missing, duplicate, unknown, manual and malformed entries.
  if exists (select 1 from jsonb_array_elements(p_returns) e
             where jsonb_typeof(e) <> 'object' or coalesce(e->>'sale_item_id','') !~ '^[0-9a-fA-F-]{36}$'
             or coalesce(e->>'quantity','') !~ '^(0|[1-9][0-9]{0,8})$') then
    raise exception 'Invalid returned quantity';
  end if;
  if jsonb_array_length(p_returns) <> (select count(*) from public.sale_items where sale_id=p_sale_id and not is_manual)
     or exists (select 1 from jsonb_array_elements(p_returns) e group by e->>'sale_item_id' having count(*) > 1)
     or exists (select 1 from jsonb_array_elements(p_returns) e
                left join public.sale_items i on i.id=(e->>'sale_item_id')::uuid and i.sale_id=p_sale_id and not i.is_manual
                where i.id is null or (e->>'quantity')::integer > i.quantity) then
    raise exception 'Returned quantities must match the original product lines';
  end if;
  -- Refuse historical sales whose stock movement totals cannot be reconciled.
  if exists (
    select 1 from (select product_id, sum(quantity)::bigint qty from public.sale_items
                   where sale_id=p_sale_id and not is_manual group by product_id) i
    full join (select product_id, -sum(quantity_delta)::bigint qty from public.stock_movements
               where sale_id=p_sale_id and kind='sale' group by product_id) m using (product_id)
    where i.product_id is null or m.product_id is null or i.qty <> m.qty
  ) then raise exception 'Original stock movements do not reconcile; review manually'; end if;
  perform 1 from public.products where id in
    (select product_id from public.sale_items where sale_id=p_sale_id and not is_manual)
    order by id for update;
  insert into public.sale_reversals(id,sale_id,actor_id,reason,money_status)
    values(v_id,p_sale_id,auth.uid(),btrim(p_reason),p_money_status);
  for v_line in select i.id, i.product_id, (e->>'quantity')::integer qty
    from jsonb_array_elements(p_returns) e join public.sale_items i on i.id=(e->>'sale_item_id')::uuid
    order by i.product_id, i.id loop
    v_return := v_line.qty; v_movement := null;
    if v_return > 0 then
      select * into strict v_product from public.products where id=v_line.product_id;
      perform set_config('pos.allow_stock_write','true',true);
      update public.products set stock_on_hand=stock_on_hand+v_return where id=v_line.product_id;
      insert into public.stock_movements(product_id,kind,quantity_delta,quantity_before,quantity_after,reason,performed_by)
        values(v_line.product_id,'void_reversal',v_return,v_product.stock_on_hand,v_product.stock_on_hand+v_return,
               'Pembetulan ' || v_sale.receipt_number || ': ' || btrim(p_reason),auth.uid()) returning id into v_movement;
    end if;
    insert into public.sale_reversal_items(reversal_id,sale_item_id,returned_quantity,stock_movement_id)
      values(v_id,v_line.id,v_return,v_movement);
  end loop;
  insert into public.audit_logs(actor_id,action,entity_type,entity_id,after_data)
    values(auth.uid(),'REVERSE_SALE','sales',p_sale_id::text,
           jsonb_build_object('reversal_id',v_id,'receipt_number',v_sale.receipt_number,
                              'reason',btrim(p_reason),'money_status',p_money_status,'returns',p_returns));
  return v_id;
end;
$$;
revoke all on function public.reverse_sale(uuid,text,text,jsonb) from public, anon, authenticated;
grant execute on function public.reverse_sale(uuid,text,text,jsonb) to authenticated;

-- The counter totals use the Malaysian calendar day, not a capped client cache.
create function public.pos_today_totals() returns jsonb
language plpgsql stable security definer set search_path=pg_catalog,public as $$
declare v_start timestamptz; v_end timestamptz; v_gross numeric; v_count bigint; v_reversed numeric;
begin
  if auth.uid() is null or not public.has_role(array['owner','admin','manager','cashier','auditor']::public.app_role[]) then
    raise exception 'Not permitted';
  end if;
  v_start := (now() at time zone 'Asia/Kuala_Lumpur')::date::timestamp at time zone 'Asia/Kuala_Lumpur';
  v_end := v_start + interval '1 day';
  select coalesce(sum(total),0),count(*) into v_gross,v_count from public.sales
    where status='completed' and completed_at>=v_start and completed_at<v_end;
  select coalesce(sum(s.total),0) into v_reversed from public.sale_reversals r join public.sales s on s.id=r.sale_id
    where r.created_at>=v_start and r.created_at<v_end;
  return jsonb_build_object('gross',v_gross,'reversed',v_reversed,'net',v_gross-v_reversed,'count',v_count);
end; $$;
revoke all on function public.pos_today_totals() from public,anon,authenticated;
grant execute on function public.pos_today_totals() to authenticated;

-- Preserve the legacy report shape while accounting for corrections on the day
-- they were recorded. Payment totals remain original payment declarations.
alter function public.get_pos_report(date,date) rename to get_pos_report_legacy_v1;
revoke all on function public.get_pos_report_legacy_v1(date,date) from public,anon,authenticated;
create function public.get_pos_report(p_from date,p_to date) returns jsonb
language plpgsql stable security definer set search_path=pg_catalog,public as $$
declare v_result jsonb; v_reverse numeric; v_gross numeric; v_count bigint; v_daily jsonb;
begin
  if auth.uid() is null or not public.has_role(array['owner','admin','auditor']::public.app_role[]) then
    raise exception 'You are not permitted to view reporting';
  end if;
  if p_from is null or p_to is null or p_from>p_to then raise exception 'Invalid reporting date range'; end if;
  v_result := public.get_pos_report_legacy_v1(p_from,p_to);
  select coalesce(sum(s.total),0) into v_reverse from public.sale_reversals r join public.sales s on s.id=r.sale_id
    where (r.created_at at time zone 'Asia/Kuala_Lumpur')::date between p_from and p_to;
  v_gross := coalesce((v_result#>>'{summary,sales_total}')::numeric,0);
  v_count := coalesce((v_result#>>'{summary,transaction_count}')::bigint,0);
  v_result := jsonb_set(v_result,'{summary,sales_total}',to_jsonb(v_gross-v_reverse));
  v_result := jsonb_set(v_result,'{summary,average_sale}',to_jsonb(case when v_count>0 then (v_gross-v_reverse)/v_count else 0 end));
  v_result := jsonb_set(v_result,'{summary,gross_sales}',to_jsonb(v_gross),true);
  v_result := jsonb_set(v_result,'{summary,reversal_total}',to_jsonb(v_reverse),true);
  v_result := v_result || jsonb_build_object('payments_definition','original payments; not evidence of returned money');
  with original as (
    select (d->>'business_date')::date as day_key, (d->>'transactions')::int as transactions, (d->>'sales_total')::numeric as amount
    from jsonb_array_elements(coalesce(v_result->'daily','[]'::jsonb)) d
  ), adjustments as (
    select (r.created_at at time zone 'Asia/Kuala_Lumpur')::date as day_key,sum(s.total) as amount
    from public.sale_reversals r join public.sales s on s.id=r.sale_id
    where (r.created_at at time zone 'Asia/Kuala_Lumpur')::date between p_from and p_to group by 1
  )
  select coalesce(jsonb_agg(jsonb_build_object('business_date',coalesce(o.day_key,a.day_key),
      'transactions',coalesce(o.transactions,0),'gross_sales',coalesce(o.amount,0),
      'reversal_total',coalesce(a.amount,0),'sales_total',coalesce(o.amount,0)-coalesce(a.amount,0))
      order by coalesce(o.day_key,a.day_key)),'[]'::jsonb) into v_daily
  from original o full join adjustments a on a.day_key=o.day_key;
  return jsonb_set(v_result,'{daily}',v_daily);
end; $$;
revoke all on function public.get_pos_report(date,date) from public,anon,authenticated;
grant execute on function public.get_pos_report(date,date) to authenticated;
