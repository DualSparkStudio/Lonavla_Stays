-- Brick & Beam style calendar + Razorpay fields (run in Supabase SQL Editor when using live DB)

CREATE TABLE IF NOT EXISTS public.blocked_dates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason VARCHAR(255) NOT NULL,
  notes TEXT,
  source VARCHAR(50) DEFAULT 'manual',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_block_dates CHECK (end_date >= start_date)
);

CREATE TABLE IF NOT EXISTS public.calendar_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS payment_gateway TEXT,
  ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT,
  ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;

CREATE INDEX IF NOT EXISTS idx_blocked_dates_room ON public.blocked_dates(room_id);
CREATE INDEX IF NOT EXISTS idx_blocked_dates_range ON public.blocked_dates(start_date, end_date);
