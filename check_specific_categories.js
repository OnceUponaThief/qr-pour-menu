// Script to check if specific categories have items
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

// Categories to check (multiple variants to account for naming)
const CATEGORY_PATTERNS = [
  'IMFL%', // e.g., IMFL ...
  'BREEZER%', 'BREEZERS%', // Breezer/Breezers
  'SHAKE%', 'SHAKES%', '%SHAKE%', // Shakes variations
  'MILKSHAKE%', '%MILKSHAKE%', // Milkshake variations
];

async function checkCategories() {
  console.log('Checking categories: IMFL, Breezers, Shakes');

  try {
    // Fetch matching items using ilike on category
    const results = [];
    for (const pattern of CATEGORY_PATTERNS) {
      const { data, error } = await supabase
        .from('menu_items')
        .select('id, name, category, price')
        .ilike('category', pattern)
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        console.error(`Error fetching for pattern ${pattern}:`, error.message);
        continue;
      }
      if (data && data.length) {
        results.push({ pattern, items: data });
      }
    }

    // Additional check: items where name contains IMFL
    const { data: imflNameMatches, error: imflNameError } = await supabase
      .from('menu_items')
      .select('id, name, category, price')
      .ilike('name', '%IMFL%');
    if (!imflNameError && imflNameMatches && imflNameMatches.length) {
      results.push({ pattern: 'name contains IMFL', items: imflNameMatches });
    }

    if (results.length === 0) {
      console.log('No items found in IMFL (as category or name), Breezers, or Shakes categories.');
      return;
    }

    // Group and print results
    for (const group of results) {
      console.log(`\n=== Category match: ${group.pattern} ===`);
      for (const item of group.items) {
        console.log(`ID: ${item.id} | ${item.name} | Category: ${item.category} | ₹${item.price}`);
      }
    }
  } catch (err) {
    console.error('Unexpected error:', err.message);
  }
}

checkCategories();