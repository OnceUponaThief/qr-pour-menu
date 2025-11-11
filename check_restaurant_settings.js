// Script to check if restaurant_settings table exists and has data
const { createClient } = require('@supabase/supabase-js');

// Replace with your Supabase URL and service role key
const supabaseUrl = process.env.SUPABASE_URL || 'https://lgqavevijsammnuncjzg.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxncWF2ZXZpanNhbW1udW5janpnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc3NTA3OSwiZXhwIjoyMDc4MzUxMDc5fQ.XXXXXXX'; // Replace with your service role key

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRestaurantSettings() {
  try {
    console.log('Checking if restaurant_settings table exists...');
    
    // Check if table exists by querying it
    const { data, error } = await supabase
      .from('restaurant_settings')
      .select('*')
      .limit(1);

    if (error) {
      console.log('Error accessing restaurant_settings table:', error.message);
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        console.log('\nTable does not exist. You need to create it first.');
        console.log('Run the SQL script in your Supabase SQL editor or use the manual script.');
      }
      return;
    }

    console.log('Table exists!');
    console.log('Data found:', data);

    if (data && data.length > 0) {
      console.log('\nRestaurant Settings:');
      console.log('- Name:', data[0].name);
      console.log('- Currency:', data[0].currency_code);
      console.log('- Language:', data[0].language_code);
    } else {
      console.log('\nNo data found in restaurant_settings table.');
    }
  } catch (error) {
    console.error('Error checking restaurant settings:', error);
  }
}

checkRestaurantSettings();