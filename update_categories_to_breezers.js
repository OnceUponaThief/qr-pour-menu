import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing Supabase env. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are set in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Breezer items to classify under 'breezers' (from migration 20251113100000_update_drink_categories.sql)
const toBreezers = [
  'BREEZER JAMAICAN',
  'BREEZER CRANBERRY',
  'BREEZER BLUEBERRY',
  'BREEZER MANGO',
  // Common flavors we may have in DB under different names
  'BREEZER ORANGE',
  'BREEZER LIME',
  'BREEZER LEMON',
];

async function run() {
  console.log('Reclassifying selected items to category = breezers ...');

  const { data: items, error: fetchErr } = await supabase
    .from('menu_items')
    .select('id,name,category')
    .in('name', toBreezers);

  if (fetchErr) {
    console.error('Failed to fetch items:', fetchErr);
    process.exit(1);
  }

  const existingByName = new Map();
  (items || []).forEach(it => existingByName.set(it.name, it));

  let updated = 0;
  let skipped = 0;
  const failures = [];

  for (const name of toBreezers) {
    const row = existingByName.get(name);
    if (!row) {
      skipped++;
      continue;
    }
    if (row.category && row.category.toLowerCase() === 'breezers') {
      skipped++;
      continue;
    }
    const { error: updErr } = await supabase
      .from('menu_items')
      .update({ category: 'breezers' })
      .eq('id', row.id);
    if (updErr) {
      failures.push({ name, error: updErr.message });
    } else {
      updated++;
    }
  }

  console.log(`Done. Updated: ${updated}, Skipped: ${skipped}, Failures: ${failures.length}`);
  if (failures.length) {
    console.log('Failures:');
    failures.forEach(f => console.log(`- ${f.name}: ${f.error}`));
  }
}

run().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});