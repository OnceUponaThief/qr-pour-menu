import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

async function run() {
  console.log('Checking presence of PINT/ML items and normalized categories...');
  const { data: pintItems, error: pintErr } = await supabase
    .from('menu_items')
    .select('id, name, category, price')
    .ilike('name', '%pint%');
  if (pintErr) { console.error('Error fetching PINT items:', pintErr); }
  console.log(`\nItems with 'PINT' in name: ${pintItems?.length ?? 0}`);
  for (const it of pintItems || []) {
    console.log(`${it.name} | ${it.category} | ₹${it.price}`);
  }

  const { data: mlItems, error: mlErr } = await supabase
    .from('menu_items')
    .select('id, name, category, price')
    .ilike('name', '% ml');
  if (mlErr) { console.error('Error fetching ML items:', mlErr); }
  console.log(`\nItems with 'ML' in name: ${mlItems?.length ?? 0}`);
  for (const it of mlItems || []) {
    console.log(`${it.name} | ${it.category} | ₹${it.price}`);
  }

  const { data: imflItems, error: imflErr } = await supabase
    .from('menu_items')
    .select('id, name, category, price')
    .eq('category', 'imfl')
    .order('name', { ascending: true });
  if (imflErr) { console.error('Error fetching IMFL items:', imflErr); }
  console.log(`\nIMFL items: ${imflItems?.length ?? 0}`);
  for (const it of imflItems || []) {
    console.log(`${it.name} | ₹${it.price}`);
  }
}

run().catch(err => console.error('Unexpected error:', err));