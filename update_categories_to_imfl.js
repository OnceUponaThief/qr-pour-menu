import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing Supabase env. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are set in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Names to reclassify to IMFL, based on migration 20251113100000_update_drink_categories.sql
const toImfl = [
  // Whiskey
  'BALLANTINES FINEST','BLACK & WHITE','J.W BLACK LABEL','J.W RED LABEL','J.W DOUBLE BLACK',
  'BLACK DOG TRIPLE GOLD','CHIVAS REGAL 12 YRS','DEWARS 12YRS','DEWARS WHITE LABEL','MONKEY SHOULDER',
  'OAKSMITH GOLD','SUNTORY TOKI','TEACHER HIGHLAND','TEACHER 50','J B RARE','JACK DANIELS','JIM BEAM',
  'JAMESON IRISH WHISKEY','BUSHMILLS','GLENFIDDICH 12YRS','GLENLIVET 12YRS','AMRUT FUSION','INDRI SINGLE MALT',
  'PAUL JOHN BRILLIANCE','PAUL JOHN BOLD',
  // Gin
  'GREATER THAN','GORDONS','BEEFEATER','BOMBAY SAPPHIRE','TANQUERAY','JAISALMER',
  // Vodka
  'GREY GOOSE','ABSOLUTE','SMIRNOFF','SMIRNOFF FLAVOUR','KETEL ONE',
  // Rum
  'OLD MONK DARK','OLD MONK WHITE','BACARDI BLACK','BACARDI CARTA BLANCA','BACARDI LIMON','BACARDI LEMON CHILLI','BACARDI MANGO CHILLI',
  // Brandy
  'HONEY BEE','MANSON HOUSE'
];

async function run() {
  console.log('Reclassifying selected items to category = imfl ...');

  // Fetch existing items for faster mapping
  const { data: items, error: fetchErr } = await supabase
    .from('menu_items')
    .select('id,name,category')
    .in('name', toImfl);

  if (fetchErr) {
    console.error('Failed to fetch items:', fetchErr);
    process.exit(1);
  }

  const existingByName = new Map();
  (items || []).forEach(it => existingByName.set(it.name, it));

  let updated = 0;
  let skipped = 0;
  const failures = [];

  for (const name of toImfl) {
    const row = existingByName.get(name);
    if (!row) {
      skipped++;
      continue; // not present in DB; will be inserted via migration later
    }
    if (row.category && row.category.toLowerCase() === 'imfl') {
      skipped++;
      continue;
    }
    const { error: updErr } = await supabase
      .from('menu_items')
      .update({ category: 'imfl' })
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