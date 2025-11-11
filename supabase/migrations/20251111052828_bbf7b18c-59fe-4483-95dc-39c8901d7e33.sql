-- Create offers table for special promotions
CREATE TABLE IF NOT EXISTS public.offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on offers
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

-- Allow public read access for active offers (customers can view without login)
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

-- Create trigger for automatic timestamp updates
DROP TRIGGER IF EXISTS update_offers_updated_at ON public.offers;
CREATE TRIGGER update_offers_updated_at
  BEFORE UPDATE ON public.offers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();