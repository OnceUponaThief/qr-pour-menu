// Script to update alcohol prices to local prices in premium bars in Hinjewadi Pune
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

// Updated prices for premium bars in Hinjewadi Pune (in INR)
const updatedPrices = [
  // Whiskey
  { name: "Blended Scotch Whiskey", category: "whiskey", newPrice: 850 },
  { name: "Single Malt Whiskey", category: "whiskey", newPrice: 1200 },
  { name: "Bourbon Whiskey", category: "whiskey", newPrice: 950 },
  { name: "Irish Whiskey", category: "whiskey", newPrice: 1100 },
  
  // Gin
  { name: "Premium Gin", category: "gin", newPrice: 750 },
  { name: "Craft Gin", category: "gin", newPrice: 900 },
  
  // Vodka
  { name: "Premium Vodka", category: "vodka", newPrice: 700 },
  { name: "Craft Vodka", category: "vodka", newPrice: 850 },
  
  // Rum
  { name: "Premium Rum", category: "rum", newPrice: 650 },
  { name: "Aged Rum", category: "rum", newPrice: 800 },
  
  // Brandy
  { name: "Fine Brandy", category: "brandy", newPrice: 750 },
  { name: "VSOP Brandy", category: "brandy", newPrice: 950 },
  
  // Beer
  { name: "Craft Beer", category: "beer", newPrice: 350 },
  { name: "Premium Beer", category: "beer", newPrice: 450 },
  
  // Wine
  { name: "Red Wine", category: "wine", newPrice: 600 },
  { name: "White Wine", category: "wine", newPrice: 600 },
  { name: "Sparkling Wine", category: "wine", newPrice: 800 },
];

async function updateAlcoholPrices() {
  console.log("Updating alcohol prices to local rates in Hinjewadi Pune...");
  
  try {
    // Fetch all menu items
    const { data: menuItems, error: fetchError } = await supabase
      .from('menu_items')
      .select('*');
    
    if (fetchError) {
      console.error("Error fetching menu items:", fetchError);
      return;
    }
    
    console.log(`Found ${menuItems.length} menu items`);
    
    let updatedCount = 0;
    
    // Update prices for matching items
    for (const priceUpdate of updatedPrices) {
      // Find matching items (case insensitive)
      const matchingItems = menuItems.filter(item => 
        item.category.toLowerCase() === priceUpdate.category.toLowerCase() &&
        item.name.toLowerCase().includes(priceUpdate.name.toLowerCase().split(' ')[0]) // Match on first word
      );
      
      for (const item of matchingItems) {
        const { error: updateError } = await supabase
          .from('menu_items')
          .update({ price: priceUpdate.newPrice })
          .eq('id', item.id);
        
        if (updateError) {
          console.error(`Error updating ${item.name}:`, updateError);
        } else {
          console.log(`Updated ${item.name} from ₹${item.price} to ₹${priceUpdate.newPrice}`);
          updatedCount++;
        }
      }
    }
    
    console.log(`Successfully updated ${updatedCount} menu items`);
    
  } catch (error) {
    console.error("Error updating alcohol prices:", error);
  }
}

// Run the update function
updateAlcoholPrices();