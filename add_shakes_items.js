// Script to add Shakes items if missing
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

const SHAKES_CATEGORY = 'shakes';
const shakesItems = [
  { name: 'Chocolate Shake', price: 250 },
  { name: 'Strawberry Shake', price: 250 },
  { name: 'Vanilla Shake', price: 200 },
  { name: 'Oreo Shake', price: 270 },
];

async function addShakesIfMissing() {
  console.log('Ensuring Shakes items exist in menu_items...');

  // Find existing shakes
  const { data: existingByCategory, error: catErr } = await supabase
    .from('menu_items')
    .select('id, name, category')
    .ilike('category', '%shake%');

  if (catErr) {
    console.error('Error checking existing shakes by category:', catErr.message);
    return;
  }

  const existingNames = new Set((existingByCategory || []).map(i => i.name.toLowerCase()));

  // Filter items to insert
  const toInsert = shakesItems.filter(i => !existingNames.has(i.name.toLowerCase()))
    .map(i => ({ name: i.name, category: SHAKES_CATEGORY, price: i.price, available: true }));

  if (toInsert.length === 0) {
    console.log('Shakes items already present. Nothing to insert.');
    return;
  }

  const { data, error } = await supabase
    .from('menu_items')
    .insert(toInsert)
    .select('id, name, category, price');

  if (error) {
    console.error('Error inserting shakes items:', error.message);
    return;
  }

  console.log('Inserted shakes items:');
  for (const item of data) {
    console.log(`ID: ${item.id} | ${item.name} | Category: ${item.category} | ₹${item.price}`);
  }
}

addShakesIfMissing();