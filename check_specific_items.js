// Script to spot-check specific Pune catalog items by name (case-insensitive)
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

const namesToCheck = [
  "mcdowell's no.1 30 ml",
  'kingfisher premium pint',
  'corona 355 ml',
  'mojito',
  'sula chenin blanc glass',
  'long islanD iced tea (liit)',
  'b-52 shot'
];

async function run() {
  console.log('Spot-checking specific items...');
  const { data, error } = await supabase
    .from('menu_items')
    .select('id, name, category, price, available')
    .in('name', namesToCheck) // direct match first
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching items (direct match):', error);
  } else {
    console.log('\nDirect matches:');
    for (const item of data || []) {
      console.log(`${item.name} | ${item.category} | ₹${item.price} | available=${item.available}`);
    }
  }

  // Fallback: case-insensitive search using ilike for each name
  console.log('\nCase-insensitive search:');
  for (const n of namesToCheck) {
    const { data: ciData, error: ciErr } = await supabase
      .from('menu_items')
      .select('id, name, category, price, available')
      .ilike('name', n.replace(/([%_])/g, '\\$1'));
    if (ciErr) {
      console.error(`  [${n}] error:`, ciErr);
      continue;
    }
    if (!ciData || ciData.length === 0) {
      console.log(`  [${n}] not found`);
    } else {
      for (const item of ciData) {
        console.log(`  [${n}] -> ${item.name} | ${item.category} | ₹${item.price} | available=${item.available}`);
      }
    }
  }
}

run().catch(err => {
  console.error('Unexpected error:', err);
});