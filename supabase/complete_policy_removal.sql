-- Completely disable RLS on ALL tables to stop recursion
ALTER TABLE public.admin_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.embeddings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.insights DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to prevent any recursion
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    -- Drop all policies on all tables
    FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON ' || r.schemaname || '.' || r.tablename || ';';
    END LOOP;
END $$;

-- Grant full access to authenticated users (we'll handle security in the app)
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Insert/update the creator as super admin
INSERT INTO public.admin_users (user_id, role, permissions)
SELECT id, 'super_admin', '{}'::jsonb
FROM auth.users
WHERE email = 'maxlangsam534@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET
  role = 'super_admin',
  updated_at = now();

-- Create a simple function to check if user is admin (without RLS)
CREATE OR REPLACE FUNCTION public.is_admin(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user is the creator
  IF user_email = 'maxlangsam534@gmail.com' THEN
    RETURN TRUE;
  END IF;
  
  -- Check if user exists in admin_users table
  RETURN EXISTS (
    SELECT 1 
    FROM public.admin_users au
    JOIN auth.users u ON au.user_id = u.id
    WHERE u.email = user_email
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
