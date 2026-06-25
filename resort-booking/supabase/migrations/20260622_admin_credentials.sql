-- Admin login credentials (hashed). Shared across all devices/browsers.
-- Run once in Supabase SQL Editor.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.admin_credentials (
  id TEXT PRIMARY KEY DEFAULT 'main',
  username TEXT NOT NULL UNIQUE DEFAULT 'admin',
  password_hash TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.admin_credentials ENABLE ROW LEVEL SECURITY;

-- No direct table access for anon/authenticated — use RPC functions only.
DROP POLICY IF EXISTS "Admin credentials deny all" ON public.admin_credentials;
CREATE POLICY "Admin credentials deny all" ON public.admin_credentials
  FOR ALL USING (false) WITH CHECK (false);

INSERT INTO public.admin_credentials (id, username, password_hash)
VALUES ('main', 'admin', crypt('admin123', gen_salt('bf')))
ON CONFLICT (id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.verify_admin_login(p_username TEXT, p_password TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stored_hash TEXT;
BEGIN
  SELECT password_hash INTO stored_hash
  FROM public.admin_credentials
  WHERE username = lower(trim(p_username))
  LIMIT 1;

  IF stored_hash IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN stored_hash = crypt(p_password, stored_hash);
END;
$$;

CREATE OR REPLACE FUNCTION public.update_admin_password(
  p_username TEXT,
  p_current_password TEXT,
  p_new_password TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stored_hash TEXT;
BEGIN
  IF length(p_new_password) < 6 THEN
    RAISE EXCEPTION 'Password must be at least 6 characters';
  END IF;

  SELECT password_hash INTO stored_hash
  FROM public.admin_credentials
  WHERE username = lower(trim(p_username))
  LIMIT 1;

  IF stored_hash IS NULL OR stored_hash <> crypt(p_current_password, stored_hash) THEN
    RETURN FALSE;
  END IF;

  UPDATE public.admin_credentials
  SET
    password_hash = crypt(p_new_password, gen_salt('bf')),
    updated_at = NOW()
  WHERE username = lower(trim(p_username));

  RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.verify_admin_login(TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.update_admin_password(TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_admin_login(TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_admin_password(TEXT, TEXT, TEXT) TO anon, authenticated;

NOTIFY pgrst, 'reload schema';
