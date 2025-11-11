// Script to create the restaurant_settings table
// Run this script to manually create the table if it doesn't exist

const { createClient } = require('@supabase/supabase-js');

// Replace with your Supabase URL and service role key
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createRestaurantSettingsTable() {
  try {
    // Create the restaurant_settings table
    const { error } = await supabase.rpc('execute_sql', {
      sql: `
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

        -- Enable RLS
        ALTER TABLE public.restaurant_settings ENABLE ROW LEVEL SECURITY;

        -- Create policies
        CREATE POLICY "Anyone can view restaurant settings"
          ON public.restaurant_settings
          FOR SELECT
          USING (true);

        CREATE POLICY "Authenticated users can insert restaurant settings"
          ON public.restaurant_settings
          FOR INSERT
          TO authenticated
          WITH CHECK (true);

        CREATE POLICY "Authenticated users can update restaurant settings"
          ON public.restaurant_settings
          FOR UPDATE
          TO authenticated
          USING (true);

        CREATE POLICY "Authenticated users can delete restaurant settings"
          ON public.restaurant_settings
          FOR DELETE
          TO authenticated
          USING (true);

        -- Create update function
        CREATE OR REPLACE FUNCTION public.handle_updated_at_restaurant_settings()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = now();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        -- Create trigger
        DROP TRIGGER IF EXISTS set_updated_at_restaurant_settings ON public.restaurant_settings;
        CREATE TRIGGER set_updated_at_restaurant_settings
          BEFORE UPDATE ON public.restaurant_settings
          FOR EACH ROW
          EXECUTE FUNCTION public.handle_updated_at_restaurant_settings();

        -- Insert default restaurant settings
        INSERT INTO public.restaurant_settings (name, currency_code, language_code, timezone) 
        VALUES ('LIVE - FOOD and LIQUID LOUNGE', 'INR', 'en', 'Asia/Kolkata')
        ON CONFLICT DO NOTHING;
      `
    });

    if (error) throw error;
    
    console.log('Restaurant settings table created successfully!');
  } catch (error) {
    console.error('Error creating restaurant settings table:', error);
  }
}

createRestaurantSettingsTable();