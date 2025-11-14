import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Breezers catalog (ready-to-drink, 275ml)
const breezers = [
  { name: 'BREEZER JAMAICAN', flavor: 'Jamaican Passion' },
  { name: 'BREEZER CRANBERRY', flavor: 'Cranberry' },
  { name: 'BREEZER BLUEBERRY', flavor: 'Blueberry' },
  { name: 'BREEZER MANGO', flavor: 'Mango' },
  { name: 'BREEZER ORANGE', flavor: 'Orange' },
  { name: 'BREEZER LIME', flavor: 'Lime' },
];

// Default pricing (update later with update_menu_pricing.js if needed)
const defaultPrice = 300; // typical bar MRP+ service for 275ml RTD; adjust as needed

async function upsertBreezers() {
  console.log('Upserting Breezers catalog...');
  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  const failures = [];

  for (const item of breezers) {
    const description = `Bacardi Breezer — ${item.flavor}`;
    const payload = {
      name: item.name,
      description,
      price: defaultPrice,
      category: 'breezers',
      image_url: null,
      available: true,
      modifiers: [],
      dietary_preferences: [],
    };

    // Check if it exists by name
    const { data: existing, error: fetchErr } = await supabase
      .from('menu_items')
      .select('id, category')
      .eq('name', item.name)
      .limit(1);

    if (fetchErr) {
      failures.push({ name: item.name, error: fetchErr.message });
      continue;
    }

    if (existing && existing.length > 0) {
      const id = existing[0].id;
      const { error: updErr } = await supabase
        .from('menu_items')
        .update({
          description,
          price: defaultPrice,
          category: 'breezers',
          image_url: null,
          available: true,
          modifiers: [],
          dietary_preferences: [],
        })
        .eq('id', id);
      if (updErr) {
        failures.push({ name: item.name, error: updErr.message });
      } else {
        updated++;
      }
    } else {
      const { error: insErr } = await supabase
        .from('menu_items')
        .insert(payload);
      if (insErr) {
        failures.push({ name: item.name, error: insErr.message });
      } else {
        inserted++;
      }
    }
  }

  console.log(`Done. Inserted: ${inserted}, Updated: ${updated}, Skipped: ${skipped}, Failures: ${failures.length}`);
  if (failures.length) {
    console.log('Failures:');
    failures.forEach(f => console.log(`- ${f.name}: ${f.error}`));
  }
}

upsertBreezers().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});