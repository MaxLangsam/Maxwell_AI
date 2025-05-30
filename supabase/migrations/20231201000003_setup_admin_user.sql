-- Ensure the admin_users table exists (in case previous migration wasn't run)
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  permissions JSONB DEFAULT '{"manage_waitlist": true, "manage_users": true, "view_analytics": true}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies for admin_users table
CREATE POLICY "Admins can view admin users" ON public.admin_users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Super admins can manage admin users" ON public.admin_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

-- Function to add admin user by email
CREATE OR REPLACE FUNCTION public.add_admin_user(
  admin_email TEXT,
  admin_role TEXT DEFAULT 'admin'
)
RETURNS UUID AS $$
DECLARE
  user_uuid UUID;
  admin_id UUID;
BEGIN
  -- Get user ID from email
  SELECT id INTO user_uuid 
  FROM auth.users 
  WHERE email = admin_email;
  
  -- If user doesn't exist, return null
  IF user_uuid IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', admin_email;
  END IF;
  
  -- Insert into admin_users
  INSERT INTO public.admin_users (user_id, role)
  VALUES (user_uuid, admin_role)
  ON CONFLICT (user_id) DO UPDATE SET
    role = EXCLUDED.role,
    created_at = NOW()
  RETURNING id INTO admin_id;
  
  -- Update user profile status
  UPDATE public.profiles 
  SET user_status = 'admin'
  WHERE user_id = user_uuid;
  
  RETURN admin_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add maxlangsam534@gmail.com as super admin
DO $$
DECLARE
  user_uuid UUID;
  admin_id UUID;
BEGIN
  -- First, check if the user exists in auth.users
  SELECT id INTO user_uuid 
  FROM auth.users 
  WHERE email = 'maxlangsam534@gmail.com';
  
  IF user_uuid IS NOT NULL THEN
    -- User exists, add them as admin
    INSERT INTO public.admin_users (user_id, role)
    VALUES (user_uuid, 'super_admin')
    ON CONFLICT (user_id) DO UPDATE SET
      role = 'super_admin',
      created_at = NOW()
    RETURNING id INTO admin_id;
    
    -- Update profile status
    INSERT INTO public.profiles (user_id, email, user_status)
    VALUES (user_uuid, 'maxlangsam534@gmail.com', 'admin')
    ON CONFLICT (user_id) DO UPDATE SET
      user_status = 'admin';
      
    RAISE NOTICE 'Successfully added maxlangsam534@gmail.com as super admin with ID: %', admin_id;
  ELSE
    RAISE NOTICE 'User maxlangsam534@gmail.com not found in auth.users. They need to sign up first, then run this again.';
  END IF;
END $$;

-- Create a view for easy admin management
CREATE OR REPLACE VIEW public.admin_users_view AS
SELECT 
  au.id,
  au.user_id,
  u.email,
  p.full_name,
  au.role,
  au.permissions,
  au.created_at
FROM public.admin_users au
JOIN auth.users u ON au.user_id = u.id
LEFT JOIN public.profiles p ON au.user_id = p.user_id;

-- Grant access to the view
GRANT SELECT ON public.admin_users_view TO authenticated;
