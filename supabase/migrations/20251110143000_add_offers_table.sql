-- Create offers table
CREATE TABLE public.offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on offers
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

-- Allow public read access for active offers (customers can view active offers without login)
CREATE POLICY "Anyone can view active offers"
  ON public.offers
  FOR SELECT
  USING (is_active = true);

-- Only authenticated users (admins) can insert offers
CREATE POLICY "Authenticated users can insert offers"
  ON public.offers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Only authenticated users (admins) can update offers
CREATE POLICY "Authenticated users can update offers"
  ON public.offers
  FOR UPDATE
  TO authenticated
  USING (true);

-- Only authenticated users (admins) can delete offers
CREATE POLICY "Authenticated users can delete offers"
  ON public.offers
  FOR DELETE
  TO authenticated
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at_offers()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER set_updated_at_offers
  BEFORE UPDATE ON public.offers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at_offers();

-- Insert default offers
INSERT INTO public.offers (title, description, is_active) VALUES
  ('Buy 2 Beers Get 1 Free', 'Purchase any two beers and get one beer free. Valid for all beer varieties.', false),
  ('Happy Hour Special', '50% off on all cocktails from 5pm to 7pm daily.', false),
  ('Weekend Brunch Deal', 'Free coffee with any breakfast item on weekends.', false);