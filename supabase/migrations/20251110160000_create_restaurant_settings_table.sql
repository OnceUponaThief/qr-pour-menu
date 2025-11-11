-- Create restaurant_settings table
CREATE TABLE IF NOT EXISTS public.restaurant_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'Restaurant Name',
  logo_url TEXT,
  currency_code TEXT DEFAULT 'INR',
  language_code TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'Asia/Kolkata',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on restaurant_settings
ALTER TABLE public.restaurant_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access for restaurant settings (customers can view without login)
CREATE POLICY "Anyone can view restaurant settings"
  ON public.restaurant_settings
  FOR SELECT
  USING (true);

-- Only authenticated users (admins) can insert restaurant settings
CREATE POLICY "Authenticated users can insert restaurant settings"
  ON public.restaurant_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Only authenticated users (admins) can update restaurant settings
CREATE POLICY "Authenticated users can update restaurant settings"
  ON public.restaurant_settings
  FOR UPDATE
  TO authenticated
  USING (true);

-- Only authenticated users (admins) can delete restaurant settings
CREATE POLICY "Authenticated users can delete restaurant settings"
  ON public.restaurant_settings
  FOR DELETE
  TO authenticated
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at_restaurant_settings()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
DROP TRIGGER IF EXISTS set_updated_at_restaurant_settings ON public.restaurant_settings;
CREATE TRIGGER set_updated_at_restaurant_settings
  BEFORE UPDATE ON public.restaurant_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at_restaurant_settings();

-- Insert default restaurant settings if none exist
INSERT INTO public.restaurant_settings (name, currency_code, language_code, timezone) 
SELECT 'LIVE - FOOD and LIQUID LOUNGE', 'INR', 'en', 'Asia/Kolkata'
WHERE NOT EXISTS (SELECT 1 FROM public.restaurant_settings);