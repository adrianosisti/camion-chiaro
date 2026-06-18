create policy "Members and drivers can read notification preferences"
on public.notification_preferences
for select
to authenticated
using (
  (select public.is_company_member(company_id))
  or (
    driver_id is not null
    and (select public.is_driver_user(driver_id))
  )
);

create policy "Operators can manage notification preferences"
on public.notification_preferences
for all
to authenticated
using ((select public.is_company_operator(company_id)))
with check ((select public.is_company_operator(company_id)));

create policy "Drivers and members can read in app notifications"
on public.in_app_notifications
for select
to authenticated
using (
  (select public.is_company_member(company_id))
  or (
    driver_id is not null
    and (select public.is_driver_user(driver_id))
  )
);

create policy "Operators can create in app notifications"
on public.in_app_notifications
for insert
to authenticated
with check ((select public.is_company_operator(company_id)));

create policy "Drivers can mark own notifications read"
on public.in_app_notifications
for update
to authenticated
using (driver_id is not null and (select public.is_driver_user(driver_id)))
with check (driver_id is not null and (select public.is_driver_user(driver_id)));

create policy "Drivers and members can read vehicle checks"
on public.vehicle_checks
for select
to authenticated
using (
  (select public.is_company_member(company_id))
  or (select public.is_driver_user(driver_id))
);

create policy "Drivers can create own vehicle checks"
on public.vehicle_checks
for insert
to authenticated
with check ((select public.is_driver_user(driver_id)));

create policy "Operators can read and manage vehicle checks"
on public.vehicle_checks
for update
to authenticated
using ((select public.is_company_operator(company_id)))
with check ((select public.is_company_operator(company_id)));

create policy "Drivers and members can read fault reports"
on public.fault_reports
for select
to authenticated
using (
  (select public.is_company_member(company_id))
  or (select public.is_driver_user(driver_id))
);

create policy "Drivers can create own fault reports"
on public.fault_reports
for insert
to authenticated
with check ((select public.is_driver_user(driver_id)));

create policy "Operators can update fault reports"
on public.fault_reports
for update
to authenticated
using ((select public.is_company_operator(company_id)))
with check ((select public.is_company_operator(company_id)));

create policy "Members can read reminder logs"
on public.reminder_logs
for select
to authenticated
using (
  (select public.is_company_member(company_id))
  or (
    driver_id is not null
    and (select public.is_driver_user(driver_id))
  )
);
