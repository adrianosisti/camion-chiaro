create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (user_id, account_type, full_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'account_type', 'company'),
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'company_name'),
    new.phone
  )
  on conflict (user_id) do nothing;

  update public.drivers
  set user_id = new.id
  where user_id is null
    and (
      (new.phone is not null and phone = new.phone)
      or (new.email is not null and auth_email = new.email)
    );

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

create trigger touch_user_profiles_updated_at
before update on public.user_profiles
for each row execute function public.touch_updated_at();

create trigger touch_companies_updated_at
before update on public.companies
for each row execute function public.touch_updated_at();

create trigger touch_drivers_updated_at
before update on public.drivers
for each row execute function public.touch_updated_at();

create trigger touch_vehicles_updated_at
before update on public.vehicles
for each row execute function public.touch_updated_at();

create trigger touch_driver_documents_updated_at
before update on public.driver_documents
for each row execute function public.touch_updated_at();

create trigger touch_compliance_items_updated_at
before update on public.compliance_items
for each row execute function public.touch_updated_at();

create trigger touch_notification_preferences_updated_at
before update on public.notification_preferences
for each row execute function public.touch_updated_at();

create trigger touch_fault_reports_updated_at
before update on public.fault_reports
for each row execute function public.touch_updated_at();
