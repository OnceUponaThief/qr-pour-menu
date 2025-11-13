-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Update RLS policies for menu_items
DROP POLICY IF EXISTS "Authenticated users can insert menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Authenticated users can update menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Authenticated users can delete menu items" ON public.menu_items;

CREATE POLICY "Admins can insert menu items"
ON public.menu_items
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update menu items"
ON public.menu_items
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete menu items"
ON public.menu_items
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Update RLS policies for offers
DROP POLICY IF EXISTS "Authenticated users can insert offers" ON public.offers;
DROP POLICY IF EXISTS "Authenticated users can update offers" ON public.offers;
DROP POLICY IF EXISTS "Authenticated users can delete offers" ON public.offers;

CREATE POLICY "Admins can insert offers"
ON public.offers
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update offers"
ON public.offers
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete offers"
ON public.offers
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Update RLS policies for restaurant_settings
DROP POLICY IF EXISTS "Authenticated users can insert settings" ON public.restaurant_settings;
DROP POLICY IF EXISTS "Authenticated users can update settings" ON public.restaurant_settings;
DROP POLICY IF EXISTS "Authenticated users can delete settings" ON public.restaurant_settings;

CREATE POLICY "Admins can insert settings"
ON public.restaurant_settings
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update settings"
ON public.restaurant_settings
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete settings"
ON public.restaurant_settings
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));