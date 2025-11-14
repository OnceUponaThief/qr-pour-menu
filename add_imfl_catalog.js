// Script to add a comprehensive IMFL catalog and mark low-end brands as unavailable
// This will upsert items into the Supabase 'menu_items' table with 30ml/60ml/90ml modifiers
// and set availability based on brand tier.

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  console.log('VITE_SUPABASE_URL:', supabaseUrl);
  console.log('VITE_SUPABASE_PUBLISHABLE_KEY:', supabaseAnonKey ? 'Found' : 'Not found');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper to build modifiers for 30ml/60ml/90ml
function buildSizeModifiers(price30) {
  const price60 = Math.round(price30 * 2);
  const price90 = Math.round(price30 * 3);
  return [
    { id: '30ml', name: '30ml', price: price30 },
    { id: '60ml', name: '60ml', price: price60 },
    { id: '90ml', name: '90ml', price: price90 },
  ];
}

// Define brand tiers
const lowEndWhisky = [
  { name: 'ROYAL STAG', price30: 200 },
  { name: 'IMPERIAL BLUE', price30: 180 },
  { name: 'MCDOWELLS NO.1 WHISKY', price30: 180 },
  { name: 'OFFICERS CHOICE', price30: 170 },
  { name: 'BAGPIPER', price30: 160 },
  { name: '8PM', price30: 170 },
  { name: 'ROYAL CHALLENGE', price30: 240 },
];

const premiumWhisky = [
  { name: 'OAKSMITH GOLD', price30: 300 },
  { name: 'BLACK & WHITE', price30: 350 },
  { name: 'J & B RARE', price30: 400 },
  { name: 'TEACHER HIGHLAND', price30: 380 },
  { name: 'TEACHER 50', price30: 400 },
  { name: 'J.W RED LABEL', price30: 450 },
  { name: 'J.W BLACK LABEL', price30: 700 },
  { name: 'J.W DOUBLE BLACK', price30: 850 },
  { name: 'BLACK DOG TRIPLE GOLD', price30: 600 },
  { name: 'CHIVAS REGAL 12 YRS', price30: 700 },
  { name: 'DEWARS WHITE LABEL', price30: 450 },
  { name: 'DEWARS 12YRS', price30: 700 },
  { name: 'JAMESON IRISH WHISKEY', price30: 500 },
  { name: 'JACK DANIELS', price30: 650 },
  { name: 'JIM BEAM', price30: 450 },
  { name: 'MONKEY SHOULDER', price30: 700 },
  { name: 'GLENFIDDICH 12YRS', price30: 1100 },
  { name: 'GLENLIVET 12YRS', price30: 1100 },
  { name: 'INDRI SINGLE MALT', price30: 700 },
  { name: 'AMRUT FUSION', price30: 800 },
  { name: 'PAUL JOHN BRILLIANCE', price30: 700 },
  { name: 'PAUL JOHN BOLD', price30: 700 },
];

const lowEndVodka = [
  { name: 'WHITE MISCHIEF', price30: 200 },
  { name: 'ROMANOV', price30: 200 },
  { name: 'MAGIC MOMENTS', price30: 250 },
];

const premiumVodka = [
  { name: 'SMIRNOFF', price30: 300 },
  { name: 'SMIRNOFF FLAVOUR', price30: 320 },
  { name: 'ABSOLUT', price30: 450 },
  { name: 'KETEL ONE', price30: 700 },
  { name: 'GREY GOOSE', price30: 900 },
];

const lowEndRum = [
  { name: 'OLD MONK DARK', price30: 250 },
  { name: 'OLD MONK WHITE', price30: 250 },
];

const premiumRum = [
  { name: 'BACARDI CARTA BLANCA', price30: 300 },
  { name: 'BACARDI BLACK', price30: 300 },
  { name: 'BACARDI LIMON', price30: 320 },
  { name: 'CAPTAIN MORGAN', price30: 300 },
];

const lowEndBrandy = [
  { name: 'HONEY BEE', price30: 250 },
  { name: 'MANSION HOUSE', price30: 300 },
];

const premiumGin = [
  { name: 'GREATER THAN', price30: 350 },
  { name: 'GORDONS', price30: 350 },
  { name: 'BEEFEATER', price30: 400 },
  { name: 'BOMBAY SAPPHIRE', price30: 450 },
  { name: 'TANQUERAY', price30: 500 },
  { name: 'JAISALMER', price30: 600 },
];

// Build full catalog entries
function buildEntries(list, available, typeLabel) {
  return list.map(({ name, price30 }) => ({
    name,
    description: `${typeLabel} - Hinjewadi Pune pricing`,
    price: price30, // base price = 30ml
    category: 'imfl',
    image_url: null,
    available,
    modifiers: buildSizeModifiers(price30),
    dietary_preferences: [],
  }));
}

const catalog = [
  // Whisky
  ...buildEntries(lowEndWhisky, false, 'Whisky'),
  ...buildEntries(premiumWhisky, true, 'Whisky'),
  // Vodka
  ...buildEntries(lowEndVodka, false, 'Vodka'),
  ...buildEntries(premiumVodka, true, 'Vodka'),
  // Rum
  ...buildEntries(lowEndRum, false, 'Rum'),
  ...buildEntries(premiumRum, true, 'Rum'),
  // Brandy
  ...buildEntries(lowEndBrandy, false, 'Brandy'),
  // Gin (generally premium in bars)
  ...buildEntries(premiumGin, true, 'Gin'),
];

async function upsertCatalog() {
  console.log('Upserting IMFL catalog (Hinjewadi Pune) with size modifiers...');

  // Upsert in batches to avoid payload issues
  const batchSize = 50;
  let successCount = 0;
  let failCount = 0;

  // Manual upsert by name (since there's no unique constraint on name)
  for (let i = 0; i < catalog.length; i += batchSize) {
    const batch = catalog.slice(i, i + batchSize);
    for (const item of batch) {
      try {
        const { data: existing, error: fetchErr } = await supabase
          .from('menu_items')
          .select('id')
          .eq('name', item.name)
          .limit(1);

        if (fetchErr) {
          console.error(`Fetch error for ${item.name}:`, fetchErr.message);
          failCount++;
          continue;
        }

        if (existing && existing.length > 0) {
          const id = existing[0].id;
          const { error: updErr } = await supabase
            .from('menu_items')
            .update({
              description: item.description,
              price: item.price,
              category: 'imfl',
              image_url: null,
              available: item.available,
              modifiers: item.modifiers,
              dietary_preferences: item.dietary_preferences,
            })
            .eq('id', id);

          if (updErr) {
            console.error(`Update error for ${item.name}:`, updErr.message);
            failCount++;
          } else {
            console.log(`Updated ${item.name}`);
            successCount++;
          }
        } else {
          const { error: insErr } = await supabase
            .from('menu_items')
            .insert(item);

          if (insErr) {
            console.error(`Insert error for ${item.name}:`, insErr.message);
            failCount++;
          } else {
            console.log(`Inserted ${item.name}`);
            successCount++;
          }
        }
      } catch (e) {
        console.error(`Unexpected error for ${item.name}:`, e.message);
        failCount++;
      }
    }
  }

  // Ensure any existing low-end brands are marked unavailable
  const lowEndNames = [
    ...lowEndWhisky.map(b => b.name),
    ...lowEndVodka.map(b => b.name),
    ...lowEndRum.map(b => b.name),
    ...lowEndBrandy.map(b => b.name),
  ];

  const { error: unavailError } = await supabase
    .from('menu_items')
    .update({ available: false, category: 'imfl' })
    .in('name', lowEndNames);

  if (unavailError) {
    console.error('Error marking low-end brands unavailable:', unavailError.message);
  } else {
    console.log('Marked low-end brands as unavailable');
  }

  console.log(`\nCompleted. Success: ${successCount}, Failures: ${failCount}`);
}

upsertCatalog();