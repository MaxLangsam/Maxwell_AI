-- Add waitlist table
CREATE TABLE IF NOT EXISTS public.waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE
);

-- Add user_status to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS user_status TEXT DEFAULT 'waitlist' CHECK (user_status IN ('waitlist', 'approved', 'admin'));

-- Create admin users table for managing access
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Function to check if user is approved
CREATE OR REPLACE FUNCTION public.is_user_approved(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.waitlist 
    WHERE email = user_email AND status = 'approved'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to approve waitlist user
CREATE OR REPLACE FUNCTION public.approve_waitlist_user(
  waitlist_email TEXT,
  admin_user_id UUID
)
RETURNS VOID AS $$
BEGIN
  -- Update waitlist status
  UPDATE public.waitlist 
  SET 
    status = 'approved',
    approved_by = admin_user_id,
    approved_at = NOW(),
    updated_at = NOW()
  WHERE email = waitlist_email;
  
  -- Update user profile if they already signed up
  UPDATE public.profiles 
  SET user_status = 'approved'
  WHERE email = waitlist_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Waitlist policies
CREATE POLICY "Users can insert their own waitlist entry" ON public.waitlist
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own waitlist entry" ON public.waitlist
  FOR SELECT USING (email = auth.jwt() ->> 'email');

CREATE POLICY "Admins can view all waitlist entries" ON public.waitlist
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- Admin users policies
CREATE POLICY "Admins can view admin users" ON public.admin_users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- Insert default admin (replace with your email)
-- INSERT INTO public.admin_users (user_id) 
-- SELECT id FROM auth.users WHERE email = 'your-admin-email@example.com';
