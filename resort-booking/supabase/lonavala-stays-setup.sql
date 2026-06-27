-- =============================================================================
-- The Lonavala Stays — Supabase database setup
-- Run this entire file once in: Supabase Dashboard → SQL Editor → New query → Run
--
-- If you get errors like "villas does not exist" OR "blocked_dates.villa_id does not exist"
-- you have the OLD rooms/room_id schema. Run FIRST:
--   supabase/migrations/20260620_reset_old_schema.sql
-- Then run this file again.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- Users (extends Supabase Auth)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  avatar TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Villas (matches app “rooms” / demo villas)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.villas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  room_type TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price_per_night NUMERIC(10, 2) NOT NULL,
  location TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  max_guests INTEGER NOT NULL DEFAULT 2,
  room_number TEXT NOT NULL,
  rating NUMERIC(2, 1) NOT NULL DEFAULT 4.5,
  review_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'available'
    CHECK (status IN ('available', 'maintenance', 'occupied')),
  amenities TEXT[] NOT NULL DEFAULT '{}',
  images TEXT[] NOT NULL DEFAULT '{}',
  map_embed_url TEXT,
  check_in_time TEXT NOT NULL DEFAULT '14:00',
  check_out_time TEXT NOT NULL DEFAULT '11:00',
  -- Matches app localStorage villa ids: 1, 2, 3, 4
  legacy_id TEXT UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT villas_room_number_unique UNIQUE (room_number)
);

-- -----------------------------------------------------------------------------
-- Bookings (guest checkout; user_id optional)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  villa_id UUID NOT NULL REFERENCES public.villas(id) ON DELETE RESTRICT,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  booking_ref TEXT NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  adults INTEGER NOT NULL DEFAULT 2,
  children INTEGER NOT NULL DEFAULT 0,
  infants INTEGER NOT NULL DEFAULT 0,
  total_amount NUMERIC(10, 2) NOT NULL,
  base_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  taxes NUMERIC(10, 2) NOT NULL DEFAULT 0,
  service_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
  cleaning_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'refunded', 'completed')),
  payment_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_gateway TEXT,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  payment_intent TEXT,
  special_requests TEXT,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  guest_phone TEXT,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT bookings_valid_dates CHECK (check_out > check_in),
  CONSTRAINT bookings_valid_adults CHECK (adults >= 1),
  CONSTRAINT bookings_booking_ref_unique UNIQUE (booking_ref)
);

-- -----------------------------------------------------------------------------
-- Blocked dates (admin calendar)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.blocked_dates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  villa_id UUID NOT NULL REFERENCES public.villas(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason VARCHAR(255) NOT NULL,
  notes TEXT,
  source VARCHAR(50) NOT NULL DEFAULT 'manual',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT blocked_dates_valid_range CHECK (end_date >= start_date)
);

-- -----------------------------------------------------------------------------
-- Site CMS (settings JSON — optional; app can sync from here later)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_settings (
  id TEXT PRIMARY KEY DEFAULT 'main',
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Facilities
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.facilities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  image TEXT,
  hours TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Properties for sale
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.properties_for_sale (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  legacy_id TEXT UNIQUE,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('villa', 'plot')),
  description TEXT NOT NULL DEFAULT '',
  long_description TEXT NOT NULL DEFAULT '',
  price_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  price_on_request BOOLEAN NOT NULL DEFAULT false,
  location TEXT NOT NULL DEFAULT '',
  address TEXT,
  bedrooms INTEGER,
  bathrooms INTEGER,
  area_label TEXT,
  status TEXT NOT NULL DEFAULT 'available'
    CHECK (status IN ('available', 'reserved', 'sold')),
  images TEXT[] NOT NULL DEFAULT '{}',
  highlights TEXT[] NOT NULL DEFAULT '{}',
  map_embed_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Contact messages
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'read', 'replied', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Indexes
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_villas_active ON public.villas(is_active);
CREATE INDEX IF NOT EXISTS idx_bookings_villa_id ON public.bookings(villa_id);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON public.bookings(check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_ref ON public.bookings(booking_ref);
CREATE INDEX IF NOT EXISTS idx_blocked_dates_villa ON public.blocked_dates(villa_id);
CREATE INDEX IF NOT EXISTS idx_blocked_dates_range ON public.blocked_dates(start_date, end_date);

-- -----------------------------------------------------------------------------
-- updated_at trigger
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_updated_at_users ON public.users;
CREATE TRIGGER set_updated_at_users
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_villas ON public.villas;
CREATE TRIGGER set_updated_at_villas
  BEFORE UPDATE ON public.villas
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_bookings ON public.bookings;
CREATE TRIGGER set_updated_at_bookings
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_properties_for_sale ON public.properties_for_sale;
CREATE TRIGGER set_updated_at_properties_for_sale
  BEFORE UPDATE ON public.properties_for_sale
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- -----------------------------------------------------------------------------
-- Auto-create public.users row on sign-up
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.villas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties_for_sale ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Helper: is current user admin?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Users
DROP POLICY IF EXISTS "Users read own or admin all" ON public.users;
CREATE POLICY "Users read own or admin all" ON public.users
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users update own" ON public.users;
CREATE POLICY "Users update own" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Villas: public read active; admin write
DROP POLICY IF EXISTS "Villas public read" ON public.villas;
CREATE POLICY "Villas public read" ON public.villas
  FOR SELECT USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Villas admin insert" ON public.villas;
CREATE POLICY "Villas admin insert" ON public.villas
  FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Villas admin update" ON public.villas;
CREATE POLICY "Villas admin update" ON public.villas
  FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "Villas admin delete" ON public.villas;
CREATE POLICY "Villas admin delete" ON public.villas
  FOR DELETE USING (public.is_admin());

-- Bookings: guest insert (no login); users see own; admin all
DROP POLICY IF EXISTS "Bookings insert guest" ON public.bookings;
CREATE POLICY "Bookings insert guest" ON public.bookings
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Bookings read own or admin" ON public.bookings;
CREATE POLICY "Bookings read own or admin" ON public.bookings
  FOR SELECT USING (
    public.is_admin()
    OR auth.uid() = user_id
    OR user_id IS NULL
  );

DROP POLICY IF EXISTS "Bookings update admin" ON public.bookings;
CREATE POLICY "Bookings update admin" ON public.bookings
  FOR UPDATE USING (public.is_admin());

-- Blocked dates: public read (availability); admin write
DROP POLICY IF EXISTS "Blocked dates public read" ON public.blocked_dates;
CREATE POLICY "Blocked dates public read" ON public.blocked_dates
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Blocked dates admin write" ON public.blocked_dates;
CREATE POLICY "Blocked dates admin write" ON public.blocked_dates
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Site settings: public read; admin write
DROP POLICY IF EXISTS "Site settings public read" ON public.site_settings;
CREATE POLICY "Site settings public read" ON public.site_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Site settings admin write" ON public.site_settings;
CREATE POLICY "Site settings admin write" ON public.site_settings
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Facilities & properties for sale: public read active
DROP POLICY IF EXISTS "Facilities public read" ON public.facilities;
CREATE POLICY "Facilities public read" ON public.facilities
  FOR SELECT USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Facilities admin write" ON public.facilities;
CREATE POLICY "Facilities admin write" ON public.facilities
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Properties for sale public read" ON public.properties_for_sale;
CREATE POLICY "Properties for sale public read" ON public.properties_for_sale
  FOR SELECT USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Properties for sale admin write" ON public.properties_for_sale;
CREATE POLICY "Properties for sale admin write" ON public.properties_for_sale
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Contact messages
DROP POLICY IF EXISTS "Contact messages anyone insert" ON public.contact_messages;
CREATE POLICY "Contact messages anyone insert" ON public.contact_messages
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Contact messages admin read" ON public.contact_messages;
CREATE POLICY "Contact messages admin read" ON public.contact_messages
  FOR SELECT USING (public.is_admin());

-- If you ran an older version of this script, add missing columns:
ALTER TABLE public.villas ADD COLUMN IF NOT EXISTS legacy_id TEXT UNIQUE;
ALTER TABLE public.properties_for_sale ADD COLUMN IF NOT EXISTS legacy_id TEXT UNIQUE;
ALTER TABLE public.properties_for_sale ADD COLUMN IF NOT EXISTS long_description TEXT NOT NULL DEFAULT '';
ALTER TABLE public.properties_for_sale ADD COLUMN IF NOT EXISTS price_on_request BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.properties_for_sale ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'available';
ALTER TABLE public.properties_for_sale ADD COLUMN IF NOT EXISTS map_embed_url TEXT;
ALTER TABLE public.properties_for_sale DROP COLUMN IF EXISTS price_display;

-- -----------------------------------------------------------------------------
-- SEED DATA — same content as the app’s localStorage demo (safe to re-run)
-- Skips rows that already exist (legacy_id / room_number / booking_ref).
-- -----------------------------------------------------------------------------

INSERT INTO public.villas (
  legacy_id, name, room_type, description, price_per_night, location, address,
  max_guests, room_number, rating, review_count, status, amenities, images
) VALUES
(
  '1', 'Valley View Villa', 'Deluxe Villa',
  'A standalone hill villa with misty Sahyadri views from a private deck. Ideal for couples and small families seeking a quiet Lonavala escape.',
  6500, 'Tiger Valley, Lonavala', 'Survey No. 12, Tiger Valley Road, Lonavala, Maharashtra 410401',
  3, 'VV-01', 4.9, 128, 'available',
  ARRAY['Valley View','Private Deck','Wi-Fi','Air Conditioning','Kitchenette','Breakfast Included'],
  ARRAY[
    'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1566665797739-1674de666a01?w=800&h=600&fit=crop'
  ]
),
(
  '2', 'Garden Wing Villa', 'Family Villa',
  'Spacious private villa with landscaped gardens and a separate living wing—perfect for families who want their own property in the hills.',
  9200, 'Tungarli, Lonavala', 'Lane 4, Near Tungarli Lake, Lonavala, Maharashtra 410403',
  5, 'GW-02', 4.8, 89, 'available',
  ARRAY['Private Garden','Living Area','Wi-Fi','Air Conditioning','Parking','BBQ Patio'],
  ARRAY[
    'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=600&fit=crop'
  ]
),
(
  '3', 'Hillside Premium Villa', 'Premium Villa',
  'Flagship villa with panoramic hill views, premium interiors, and a large sit-out—our most requested property for special occasions.',
  11500, 'Khandala Hills, Lonavala', 'Plot 8, Khandala View Road, Lonavala, Maharashtra 410401',
  4, 'HP-03', 5.0, 64, 'available',
  ARRAY['Panoramic View','King Bed','Private Pool','Wi-Fi','Chef on Request','Tea/Coffee Bar'],
  ARRAY[
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop'
  ]
),
(
  '4', 'Garden Cottage Villa', 'Cottage Villa',
  'Intimate standalone cottage tucked into greenery—romantic, private, and fully self-contained with its own entrance and patio.',
  7800, 'Kurvande, Lonavala', 'Cottage 12, Green Meadows Estate, Kurvande, Lonavala 410401',
  2, 'GC-04', 4.7, 52, 'available',
  ARRAY['Private Entry','Garden Patio','Wi-Fi','Air Conditioning','Complimentary Breakfast','Parking'],
  ARRAY[
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800&h=600&fit=crop'
  ]
)
ON CONFLICT (legacy_id) DO NOTHING;

INSERT INTO public.facilities (name, description, image, hours)
SELECT v.name, v.description, v.image, v.hours
FROM (VALUES
  ('Private & shared pools', 'Select villas include plunge or infinity pools; others are a short drive from scenic lake spots.', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=500&fit=crop', 'Varies by villa'),
  ('In-villa wellness', 'Spa and massage partners can be arranged at your villa—no need to leave the property.', 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&h=500&fit=crop', 'By appointment'),
  ('Chef & dining', 'In-villa meals, barbecue nights, and local Maharashtrian menus on request across the collection.', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=500&fit=crop', 'On request'),
  ('Outdoor experiences', 'Bonfires, stargazing decks, and terrace evenings—set up at villas with outdoor space.', 'https://images.unsplash.com/photo-1517457373958-b7bdd4587209?w=800&h=500&fit=crop', 'Seasonal'),
  ('Nature trails & treks', 'Our team coordinates guided walks and viewpoints near each villa''s neighbourhood.', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=500&fit=crop', 'By appointment'),
  ('Family recreation', 'Board games, indoor lounges, and kid-friendly setups—amenities vary; check each villa listing.', 'https://images.unsplash.com/photo-1517457373958-b7bdd4587209?w=800&h=500&fit=crop', 'Varies by villa')
) AS v(name, description, image, hours)
WHERE NOT EXISTS (SELECT 1 FROM public.facilities LIMIT 1);

INSERT INTO public.site_settings (id, data)
VALUES (
  'main',
  $json${
    "resortName": "Lonavala Stays",
    "brandTagline": "Curated luxury villas across Lonavala",
    "resortLocation": "Lonavala, Maharashtra",
    "resortAddress": "Office 2, Hill Plaza, Old Mumbai-Pune Highway, Lonavala 410401",
    "resortPhone": "+91 98765 43210",
    "resortEmail": "stay@lonavalastays.com",
    "heroTitle": "Escape Into The Hills",
    "heroSubtitle": "Book luxury villa stays or explore plots & villas for sale across Lonavala—each with its own home and hillside setting.",
    "aboutImage": "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=900&h=600&fit=crop",
    "aboutParagraphs": [
      "The Lonavala Stays curated luxury villas across Lonavala. We are not a single hotel—we curate, operate, and book multiple private villas across Lonavala, Maharashtra, each managed as its own property.",
      "Whether you need one villa for a weekend or want to understand how we manage an entire portfolio, our team handles reservations, housekeeping, and guest care villa by villa."
    ],
    "aboutHighlights": [
      {"title": "Multiple villas, one brand", "text": "We manage a portfolio of standalone villas—each with its own address, style, and amenities—under trusted Lonavala hospitality."},
      {"title": "Locally rooted", "text": "Our on-ground team lives in Lonavala. We match you to the right villa and share the best trails, views, and seasonal tips."},
      {"title": "End-to-end management", "text": "From booking and housekeeping to maintenance and guest support, we run every villa so owners and guests enjoy a seamless stay."}
    ],
    "exploreTiles": [
      {"name": "All villas", "path": "/villas", "image": "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&h=600&fit=crop&auto=format&q=80"},
      {"name": "For sale", "path": "/for-sale", "image": "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=600&fit=crop&auto=format&q=80"},
      {"name": "Facilities", "path": "/facilities", "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop&auto=format&q=80"},
      {"name": "Contact", "path": "/contact", "image": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop"}
    ],
    "villasPageTitle": "Our villas",
    "villasPageSubtitle": "Curated luxury villas across Lonavala. Each listing is a separate private villa—compare locations, capacity, and amenities to find your fit.",
    "facilitiesPageTitle": "Our facilities",
    "facilitiesPageSubtitle": "Experiences and amenities across our villa collection. What is included depends on the villa you book—see each listing for details.",
    "forSalePageTitle": "Plots & villas for sale",
    "forSalePageSubtitle": "Own a piece of Lonavala. Browse our curated plots and ready villas—view full galleries and descriptions, then contact us to schedule a visit or request documents.",
    "contactPageSubtitle": "Questions about a villa stay, a plot or villa for sale, availability, or directions? Our team manages every property in our collection."
  }$json$::jsonb
)
ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW();

-- Properties for sale (6 listings)
INSERT INTO public.properties_for_sale (
  legacy_id, title, category, description, long_description, price_amount, price_on_request,
  location, address, area_label, bedrooms, bathrooms, status, highlights, images, sort_order
) VALUES
(
  'sale-villa-1', 'Sunset Ridge Villa', 'villa',
  'Fully furnished 4 BHK hill villa with valley views, private pool, and clear title—ready to move in or use as a holiday home.',
  'Sunset Ridge is a standalone villa on a 8,000 sq ft plot in a gated Lonavala neighbourhood. The home includes a double-height living room, modular kitchen, four en-suite bedrooms, and a heated plunge pool.',
  28500000, false, 'Tiger Valley, Lonavala', 'Survey No. 45, Tiger Valley Road, Lonavala, Maharashtra 410401',
  '3,200 sq ft built-up · 8,000 sq ft plot', 4, 4, 'available',
  ARRAY['Clear title','Private pool','Furnished','Valley view','Gated community','Parking for 3 cars'],
  ARRAY['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop'], 1
),
(
  'sale-villa-2', 'Mistwood Cottage Estate', 'villa',
  'Charming 3 BHK stone-and-wood cottage on half an acre—surrounded by native trees, minutes from Tungarli Lake.',
  'Mistwood Cottage blends colonial architecture with modern comforts. Spread across two levels, the property features a wraparound veranda, fireplace lounge, and landscaped garden with a gazebo.',
  19200000, false, 'Tungarli, Lonavala', 'Lane 7, Near Tungarli Lake, Lonavala, Maharashtra 410403',
  '2,400 sq ft built-up · 22,000 sq ft land', 3, 3, 'available',
  ARRAY['Heritage style','Large garden','Lake proximity','Approved plans','Servant room','Bore well'],
  ARRAY['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1605276374101-e4f283423591?w=800&h=600&fit=crop'], 2
),
(
  'sale-plot-1', 'Hilltop NA Plot — Khandala View', 'plot',
  'NA-sanctioned 10,000 sq ft plot with unobstructed Sahyadri views. Ideal for a weekend villa or boutique stay project.',
  'This east-facing NA plot sits on a gentle slope with a 40 ft road access. Electricity and water connections available at the boundary wall.',
  8500000, false, 'Khandala Hills, Lonavala', 'Plot 14, Green Ridge Layout, Khandala View Road, Lonavala 410401',
  '10,000 sq ft (NA sanctioned)', NULL, NULL, 'available',
  ARRAY['NA sanctioned','Road access','Panoramic view','Corner plot','Electricity at gate','Clear title'],
  ARRAY['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=600&fit=crop'], 3
),
(
  'sale-plot-2', 'Valley Meadows — Twin Plots', 'plot',
  'Two adjacent 5,000 sq ft plots in a premium Lonavala layout. Buy one or both—perfect for a family compound or twin villas.',
  'Valley Meadows is a boutique plotted development with internal roads, street lighting, and 24/7 security. Each plot has individual 7/12 extract and is ready for construction.',
  4200000, false, 'Kurvande, Lonavala', 'Block C, Valley Meadows, Kurvande, Lonavala 410401',
  '5,000 sq ft each (2 plots available)', NULL, NULL, 'available',
  ARRAY['Gated layout','Individual 7/12','Clubhouse access','Twin plot option','Internal roads','Security'],
  ARRAY['https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop'], 4
),
(
  'sale-plot-3', 'Riverside Agricultural Land', 'plot',
  '1.2 acre riverside land with conversion potential—suited for farmhouse, agro-tourism, or long-term investment.',
  'A scenic parcel along a seasonal stream, bordered by mature trees. Currently agricultural; conversion documentation in progress.',
  0, true, 'Dhamandri, Lonavala outskirts', 'Gat No. 892, Dhamandri Village, Maval Taluka, Pune District',
  '1.2 acres (approx. 52,000 sq ft)', NULL, NULL, 'available',
  ARRAY['Riverside','Farmhouse potential','Tar road access','Natural tree cover','Investment grade','Due diligence pack'],
  ARRAY['https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1426604966848-d7ad8d227736?w=800&h=600&fit=crop'], 5
),
(
  'sale-villa-3', 'Cloud Nine Penthouse Villa', 'villa',
  'Ultra-premium 5 BHK duplex villa with home theatre, rooftop terrace, and smart-home automation throughout.',
  'Cloud Nine occupies the top two floors of a boutique building with a private lift lobby. Italian marble flooring, imported fittings, and a chef''s kitchen define the interiors.',
  45000000, false, 'Lonavala Town', 'Cloud Nine Residences, Old Mumbai-Pune Highway, Lonavala 410401',
  '4,800 sq ft built-up + 1,200 sq ft terrace', 5, 5, 'reserved',
  ARRAY['Smart home','Private lift','Rooftop jacuzzi','Home theatre','Premium fittings','Town centre'],
  ARRAY['https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop'], 6
)
ON CONFLICT (legacy_id) DO NOTHING;

-- Sample bookings (admin calendar / demo — same as localStorage)
INSERT INTO public.bookings (
  villa_id, booking_ref, check_in, check_out, adults, children,
  total_amount, base_amount, taxes, status, payment_status,
  guest_name, guest_email, guest_phone
)
SELECT
  v.id, 'RB123456', '2026-06-12'::date, '2026-06-15'::date, 2, 0,
  19500, 16500, 3000, 'confirmed', 'paid',
  'John Smith', 'john.smith@email.com', '+91 98765 43210'
FROM public.villas v WHERE v.legacy_id = '1'
ON CONFLICT (booking_ref) DO NOTHING;

INSERT INTO public.bookings (
  villa_id, booking_ref, check_in, check_out, adults, children,
  total_amount, base_amount, taxes, status, payment_status,
  guest_name, guest_email, guest_phone
)
SELECT
  v.id, 'RB789012', '2026-06-20'::date, '2026-06-22'::date, 4, 0,
  18400, 15600, 2800, 'pending', 'pending',
  'Sarah Johnson', 'sarah.j@email.com', '+91 87654 32109'
FROM public.villas v WHERE v.legacy_id = '2'
ON CONFLICT (booking_ref) DO NOTHING;

-- -----------------------------------------------------------------------------
-- Optional: promote your Supabase auth user to admin (run after you sign up)
-- Replace the email below, then uncomment and run only that statement:
-- -----------------------------------------------------------------------------
-- UPDATE public.users SET role = 'admin' WHERE email = 'your-email@example.com';

-- -----------------------------------------------------------------------------
-- CMS write access (required: admin panel uses local login, not Supabase Auth)
-- Run these so villas / for-sale CRUD works with the anon key.
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Villas CMS write" ON public.villas;
CREATE POLICY "Villas CMS write" ON public.villas
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Properties CMS write" ON public.properties_for_sale;
CREATE POLICY "Properties CMS write" ON public.properties_for_sale
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Facilities CMS write" ON public.facilities;
CREATE POLICY "Facilities CMS write" ON public.facilities
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Site settings CMS write" ON public.site_settings;
CREATE POLICY "Site settings CMS write" ON public.site_settings
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Blocked dates CMS write" ON public.blocked_dates;
CREATE POLICY "Blocked dates CMS write" ON public.blocked_dates
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Bookings CMS write" ON public.bookings;
CREATE POLICY "Bookings CMS write" ON public.bookings
  FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Bookings CMS delete" ON public.bookings;
CREATE POLICY "Bookings CMS delete" ON public.bookings
  FOR DELETE USING (true);

DROP POLICY IF EXISTS "Contact messages CMS delete" ON public.contact_messages;
CREATE POLICY "Contact messages CMS delete" ON public.contact_messages
  FOR DELETE USING (true);

NOTIFY pgrst, 'reload schema';
