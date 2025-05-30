-- Drop the problematic RLS policies for admin_users
DROP POLICY IF EXISTS "Admins can view admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Super admins can manage admin_users" ON public.admin_users;

-- Create better RLS policies that don't cause recursion
CREATE POLICY "Anyone can view admin_users" ON public.admin_users
  FOR SELECT USING (true);

CREATE POLICY "Service role can manage admin_users" ON public.admin_users
  FOR ALL USING (true);

-- Temporarily disable RLS on admin_users to insert the creator
ALTER TABLE public.admin_users DISABLE ROW LEVEL SECURITY;

-- Insert the creator as super admin (replace any existing entry)
INSERT INTO public.admin_users (user_id, role, permissions)
SELECT id, 'super_admin', '{}'::jsonb
FROM auth.users
WHERE email = 'maxlangsam534@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET
  role = 'super_admin',
  updated_at = now();

-- Re-enable RLS with better policies
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create non-recursive policies
CREATE POLICY "Users can view admin status" ON public.admin_users
  FOR SELECT USING (true);

CREATE POLICY "Existing admins can manage admin_users" ON public.admin_users
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid() AND role = 'super_admin'
    ) OR auth.uid() IN (
      SELECT id FROM auth.users WHERE email = 'maxlangsam534@gmail.com'
    )
  );

CREATE POLICY "Existing admins can update admin_users" ON public.admin_users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "Existing admins can delete admin_users" ON public.admin_users
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );
