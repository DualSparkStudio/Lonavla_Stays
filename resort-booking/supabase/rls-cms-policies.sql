-- Run once in Supabase SQL Editor if admin CMS edits fail (local admin login is not Supabase auth).
-- Tighten these policies later when using Supabase Auth + role = 'admin'.

DROP POLICY IF EXISTS "Villas CMS write" ON public.villas;
CREATE POLICY "Villas CMS write" ON public.villas
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Bookings CMS write" ON public.bookings;
CREATE POLICY "Bookings CMS write" ON public.bookings
  FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Bookings CMS delete" ON public.bookings;
CREATE POLICY "Bookings CMS delete" ON public.bookings
  FOR DELETE USING (true);

DROP POLICY IF EXISTS "Blocked dates CMS write" ON public.blocked_dates;
CREATE POLICY "Blocked dates CMS write" ON public.blocked_dates
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Site settings CMS write" ON public.site_settings;
CREATE POLICY "Site settings CMS write" ON public.site_settings
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Facilities CMS write" ON public.facilities;
CREATE POLICY "Facilities CMS write" ON public.facilities
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Properties CMS write" ON public.properties_for_sale;
CREATE POLICY "Properties CMS write" ON public.properties_for_sale
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Contact messages CMS delete" ON public.contact_messages;
CREATE POLICY "Contact messages CMS delete" ON public.contact_messages
  FOR DELETE USING (true);
