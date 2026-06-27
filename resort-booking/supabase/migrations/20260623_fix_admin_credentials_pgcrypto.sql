-- Fix admin login: pgcrypto lives in extensions schema on Supabase.
-- Safe to re-run. Drops old functions first.

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

DROP FUNCTION IF EXISTS public.verify_admin_login(TEXT, TEXT);
DROP FUNCTION IF EXISTS public.update_admin_password(TEXT, TEXT, TEXT);

CREATE FUNCTION public.verify_admin_login(p_username TEXT, p_password TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
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

  RETURN stored_hash = extensions.crypt(p_password, stored_hash);
END;
$$;

CREATE FUNCTION public.update_admin_password(
  p_username TEXT,
  p_current_password TEXT,
  p_new_password TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
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

  IF stored_hash IS NULL OR stored_hash <> extensions.crypt(p_current_password, stored_hash) THEN
    RETURN FALSE;
  END IF;

  UPDATE public.admin_credentials
  SET
    password_hash = extensions.crypt(p_new_password, extensions.gen_salt('bf')),
    updated_at = NOW()
  WHERE username = lower(trim(p_username));

  RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.verify_admin_login(TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_admin_password(TEXT, TEXT, TEXT) TO anon, authenticated;

UPDATE public.admin_credentials
SET password_hash = extensions.crypt('admin123', extensions.gen_salt('bf')), updated_at = NOW()
WHERE username = 'admin';

NOTIFY pgrst, 'reload schema';
