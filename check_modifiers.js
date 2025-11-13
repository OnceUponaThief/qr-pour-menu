// Script to check modifiers (size options) for spirits
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

async function checkModifiers() {
  console.log("Checking modifiers (size options) for spirits...");
  const spiritCats = ['whiskey', 'whisky', 'gin', 'vodka', 'rum', 'brandy'];
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select('id, name, category, modifiers')
      .order('category', { ascending: true })
      .order('name', { ascending: true });
    if (error) {
      console.error('Error fetching items:', error);
      return;
    }
    const spirits = data.filter(item => spiritCats.some(cat => item.category?.toLowerCase().includes(cat)));
    console.log(`Found ${spirits.length} spirit items`);
    let withMods = 0;
    let withoutMods = 0;
    spirits.forEach(item => {
      const mods = Array.isArray(item.modifiers) ? item.modifiers : (typeof item.modifiers === 'string' ? JSON.parse(item.modifiers || '[]') : []);
      const hasMods = mods && mods.length > 0;
      if (hasMods) withMods++; else withoutMods++;
      console.log(`${hasMods ? '✅' : '❌'} ${item.name} (${item.category}) -> modifiers: ${hasMods ? JSON.stringify(mods) : 'none'}`);
    });
    console.log(`\nSummary: ${withMods} with modifiers, ${withoutMods} without modifiers`);
  } catch (e) {
    console.error('Error:', e);
  }
}

checkModifiers();