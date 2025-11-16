import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { MenuCard } from "@/components/MenuCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Search, Sparkles, ChefHat, Leaf, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  image_url: string | null;
  available: boolean;
  modifiers?: Modifier[]; // Add modifiers field
  dietary_preferences?: string[]; // Add dietary preferences field
  seasonal?: boolean; // Add seasonal flag
  chef_special?: boolean; // Add chef special flag
}

// Add new interfaces for modifiers
interface Modifier {
  id: string;
  name: string;
  price: number;
  max_selections?: number;
  required?: boolean;
}

interface Offer {
  id: string;
  title: string;
  description: string | null;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
}

interface RestaurantSettings {
  id: string;
  name: string;
  logo_url: string | null;
  currency_code: string | null;
  language_code: string | null;
  timezone: string | null;
  created_at: string | null;
  updated_at: string | null;
}

// Define category groups for better organization
const CATEGORY_GROUPS = {
  drinks: [
    "drinks",
    "cocktail",
    "cocktails",
    "mocktail",
    "mocktails",
    "non-alcoholic",
    "shake",
    "shakes",
    "milkshake",
    "milkshakes",
    "beer",
    "wine",
    "whiskey",
    "whisky",
    "vodka",
    "gin",
    "rum",
    "brandy",
    "tequila",
    "liqueur",
    "liqueurs",
    "shots",
    "breezers",
    "imfl",
  ],
  food: ["food", "appetizers", "soup", "main course", "rice", "noodles", "dal", "bread", "desserts"],
};

// Drink type filters to allow quick access to sub-categories like Cocktail, Mocktail, etc.
const DRINK_TYPE_FILTERS: Record<string, string[]> = {
  all: [],
  cocktail: ["cocktail", "cocktails", "mixology"],
  mocktail: ["mocktail", "mocktails", "non-alcoholic", "virgin"],
  beer: ["beer", "beers", "draught", "lager", "ipa", "stout"],
  wine: ["wine", "wines", "red wine", "white wine", "sparkling", "rose"],
  whiskey: ["whiskey", "whisky", "scotch", "bourbon", "single malt"],
  vodka: ["vodka"],
  gin: ["gin"],
  rum: ["rum"],
  brandy: ["brandy"],
  tequila: ["tequila"],
  liqueur: ["liqueur", "liqueurs"],
  imfl: ["imfl"],
  shots: ["shots", "shot"],
  breezers: ["breezers", "breezer"],
  shakes: ["shake", "shakes", "milkshake", "milkshakes"],
};

const Menu = () => {
  const { t, i18n } = useTranslation();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [restaurantSettings, setRestaurantSettings] = useState<RestaurantSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("drinks");
  const [drinkFilter, setDrinkFilter] = useState<keyof typeof DRINK_TYPE_FILTERS>("all");
  const [isHappyHour, setIsHappyHour] = useState(false);
  
  // Filter active offers
  const activeOffers = offers.filter(offer => offer.is_active);
  
  // Check if current time is within happy hours (14:00 - 18:00)
  const checkHappyHour = () => {
    const now = new Date();
    const hours = now.getHours();
    return hours >= 14 && hours < 18;
  };
  
  // Update happy hour status every minute
  useEffect(() => {
    setIsHappyHour(checkHappyHour());
    const interval = setInterval(() => {
      setIsHappyHour(checkHappyHour());
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    Promise.all([fetchMenuItems(), fetchOffers(), fetchRestaurantSettings()]);
  }, []);

  useEffect(() => {
    // Update language when restaurant settings change
    if (restaurantSettings?.language_code) {
      i18n.changeLanguage(restaurantSettings.language_code);
    }
  }, [restaurantSettings, i18n]);

  const fetchMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .order("category", { ascending: true })
        .order("name", { ascending: true });

      if (error) throw error;

      if (data) {
        // Cast modifiers and dietary_preferences from Json to proper types
        const itemsWithModifiers = data.map(item => ({
          ...item,
          modifiers: (item.modifiers as unknown as Modifier[]) || [],
          dietary_preferences: (item.dietary_preferences as unknown as string[]) || [],
          seasonal: item.seasonal || false,
          chef_special: item.chef_special || false
        }));
        setMenuItems(itemsWithModifiers);
        const uniqueCategories = Array.from(new Set(data.map((item) => item.category)));
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error("Error fetching menu items:", error);
    }
  };

  const fetchOffers = async () => {
    try {
      const { data, error } = await supabase
        .from("offers")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        setOffers(data);
      }
    } catch (error) {
      console.error("Error fetching offers:", error);
    }
  };

  const fetchRestaurantSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("restaurant_settings")
        .select("*")
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        setRestaurantSettings(data[0]);
      }
    } catch (error) {
      console.error("Error fetching restaurant settings:", error);
    } finally {
      setLoading(false);
    }
  };

  // Group categories for tab display
  const getGroupedCategories = () => {
    const grouped: Record<string, string[]> = {
      drinks: [],
      food: [],
      other: [],
    };

    categories.forEach((category) => {
      const lowerCategory = category.toLowerCase();
      let found = false;

      // Check drinks group
      if (CATEGORY_GROUPS.drinks.some((drinkCat) => lowerCategory.includes(drinkCat) || lowerCategory === drinkCat)) {
        grouped.drinks.push(category);
        found = true;
      }

      // Check food group
      if (CATEGORY_GROUPS.food.some((foodCat) => lowerCategory.includes(foodCat) || lowerCategory === foodCat)) {
        grouped.food.push(category);
        found = true;
      }

      // If not found in any group, add to other
      if (!found) {
        grouped.other.push(category);
      }
    });

    return grouped;
  };

  // Filter items by group
  const getItemsByGroup = (group: string) => {
    const groupedCategories = getGroupedCategories();
    const groupCategories = groupedCategories[group as keyof typeof groupedCategories] || [];
    
    if (group === "other") {
      // For "other" group, include all categories not in drinks or food
      const allGroupedCategories = [...groupedCategories.drinks, ...groupedCategories.food];
      return menuItems.filter(item => !allGroupedCategories.includes(item.category));
    }
    
    return menuItems.filter(item => 
      groupCategories.some(cat => cat === item.category)
    );
  };

  // Get unique categories within a group for sub-tabs
  const getSubCategories = (group: string) => {
    const items = getItemsByGroup(group);
    return Array.from(new Set(items.map(item => item.category)));
  };

  // Format price based on restaurant settings
  const formatPrice = (price: number) => {
    const currencyCode = restaurantSettings?.currency_code || 'INR';
    const languageCode = restaurantSettings?.language_code || 'en';
    
    // Map language code to locale
    const localeMap: Record<string, string> = {
      'en': 'en-US',
      'es': 'es-ES',
      'fr': 'fr-FR',
      'hi': 'hi-IN',
      'de': 'de-DE',
      'ja': 'ja-JP',
      'zh': 'zh-CN'
    };
    
    const locale = localeMap[languageCode] || 'en-US';
    return formatCurrency(price, currencyCode, locale);
  };
  
  // Calculate happy hour price (15% discount)
  const getHappyHourPrice = (originalPrice: number) => {
    return originalPrice * 0.85; // 15% discount
  };

  // Filter menu items based on search query
  const getFilteredMenuItems = () => {
    if (!searchQuery) return menuItems;
    
    const query = searchQuery.toLowerCase().trim();
    return menuItems.filter(item => 
      item.name.toLowerCase().includes(query) || 
      (item.description && item.description.toLowerCase().includes(query)) ||
      item.category.toLowerCase().includes(query) ||
      (item.dietary_preferences && item.dietary_preferences.some(pref => pref.toLowerCase().includes(query)))
    );
  };

  // Group items by category with special sections
  const getGroupedMenuItems = () => {
    const filteredItems = getFilteredMenuItems();
    
    // Separate special items
    const seasonalItems = filteredItems.filter(item => item.seasonal);
    const chefSpecialItems = filteredItems.filter(item => item.chef_special);
    
    // Regular items (not seasonal or chef special)
    const regularItems = filteredItems.filter(item => !item.seasonal && !item.chef_special);
    
    // Group regular items by category
    const grouped: Record<string, MenuItem[]> = {};
    regularItems.forEach(item => {
      if (!grouped[item.category]) {
        grouped[item.category] = [];
      }
      grouped[item.category].push(item);
    });
    
    return {
      regular: grouped,
      seasonal: seasonalItems,
      chefSpecial: chefSpecialItems
    };
  };

  // Handle add to cart
  const handleAddToCart = (item: MenuItem) => {
    console.log("Add to cart:", item);
    // Implementation would go here
  };

  // Render menu items for a specific category
  const renderMenuItems = () => {
    const groupedItems = getGroupedMenuItems();
    
    if (searchQuery) {
      // When searching, show all results in a flat list
      const filteredItems = getFilteredMenuItems();
      if (filteredItems.length === 0) {
        return (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t('menu.search.noResults')}</p>
          </div>
        );
      }
      
      return (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredItems.map((item) => (
            <MenuCard 
              key={item.id} 
              name={item.name}
              description={item.description || undefined}
              price={formatPrice(item.price)}
              happyHourPrice={isHappyHour ? formatPrice(getHappyHourPrice(item.price)) : undefined}
              isHappyHour={isHappyHour}
              category={item.category}
              imageUrl={item.image_url || undefined}
              available={item.available}
              modifiers={item.modifiers}
              dietary_preferences={item.dietary_preferences}
              seasonal={item.seasonal}
              chef_special={item.chef_special}
            />
          ))}
        </div>
      );
    }
    
    // Show items based on active tab
    if (activeTab === "drinks") {
      const drinkCategories = Object.keys(groupedItems.regular).filter(cat => 
        CATEGORY_GROUPS.drinks.some(drinkCat => 
          cat.toLowerCase().includes(drinkCat) || cat.toLowerCase() === drinkCat
        )
      );

      // Apply sub-filter by drink type
      const drinkCategoriesFiltered = drinkFilter === "all"
        ? drinkCategories
        : drinkCategories.filter(cat => {
            const lc = cat.toLowerCase();
            const keywords = DRINK_TYPE_FILTERS[drinkFilter] || [];
            return keywords.some(k => lc.includes(k) || lc === k);
          });
      
      if (drinkCategories.length === 0) {
        return (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No drink items available</p>
          </div>
        );
      }
      
      return (
        <div className="space-y-12">
          {/* Sub-filter row for drink types */}
          <div className="mb-4 flex gap-2 flex-wrap">
            {Object.keys(DRINK_TYPE_FILTERS).map((type) => (
              <Button
                key={type}
                variant={drinkFilter === type ? "default" : "ghost"}
                className={
                  drinkFilter === type
                    ? "bg-gradient-to-r from-[hsl(var(--brand-from-hsl))] via-[hsl(var(--brand-via-hsl))] to-[hsl(var(--brand-to-hsl))] text-gray-900"
                    : "text-cyan-300"
                }
                onClick={() => setDrinkFilter(type as keyof typeof DRINK_TYPE_FILTERS)}
              >
                {type === "all" ? "All" : type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
          </div>
          {drinkCategoriesFiltered.map(category => (
            <div key={category}>
              <h3 className="text-2xl font-bold mb-6 capitalize">{category}</h3>
               <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {groupedItems.regular[category]?.map((item) => (
                  <MenuCard 
                    key={item.id} 
                    name={item.name}
                    description={item.description || undefined}
                    price={formatPrice(item.price)}
                    happyHourPrice={isHappyHour ? formatPrice(getHappyHourPrice(item.price)) : undefined}
                    isHappyHour={isHappyHour}
                    category={item.category}
                    imageUrl={item.image_url || undefined}
                    available={item.available}
                    modifiers={item.modifiers}
                    dietary_preferences={item.dietary_preferences}
                    seasonal={item.seasonal}
                    chef_special={item.chef_special}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }
    
    if (activeTab === "food") {
      const foodCategories = Object.keys(groupedItems.regular).filter(cat => 
        CATEGORY_GROUPS.food.some(foodCat => 
          cat.toLowerCase().includes(foodCat) || cat.toLowerCase() === foodCat
        )
      );
      
      if (foodCategories.length === 0) {
        return (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No food items available</p>
          </div>
        );
      }
      
      return (
        <div className="space-y-12">
          {foodCategories.map(category => (
            <div key={category}>
              <h3 className="text-2xl font-bold mb-6 capitalize">{category}</h3>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {groupedItems.regular[category]?.map((item) => (
                  <MenuCard 
                    key={item.id} 
                    name={item.name}
                    description={item.description || undefined}
                    price={formatPrice(item.price)}
                    happyHourPrice={isHappyHour ? formatPrice(getHappyHourPrice(item.price)) : undefined}
                    isHappyHour={isHappyHour}
                    category={item.category}
                    imageUrl={item.image_url || undefined}
                    available={item.available}
                    modifiers={item.modifiers}
                    dietary_preferences={item.dietary_preferences}
                    seasonal={item.seasonal}
                    chef_special={item.chef_special}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }
    
    // Show all items grouped by category
    const allCategories = Object.keys(groupedItems.regular);
    
    if (allCategories.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No menu items available</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-12">
        {allCategories.map(category => (
          <div key={category}>
            <h3 className="text-2xl font-bold mb-6 capitalize">{category}</h3>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {groupedItems.regular[category]?.map((item) => (
                <MenuCard 
                  key={item.id} 
                  name={item.name}
                  description={item.description || undefined}
                  price={formatPrice(item.price)}
                  happyHourPrice={isHappyHour ? formatPrice(getHappyHourPrice(item.price)) : undefined}
                  isHappyHour={isHappyHour}
                  category={item.category}
                  imageUrl={item.image_url || undefined}
                  available={item.available}
                  modifiers={item.modifiers}
                  dietary_preferences={item.dietary_preferences}
                  seasonal={item.seasonal}
                  chef_special={item.chef_special}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Get grouped menu items
  const groupedItems = getGroupedMenuItems();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight mb-2 brand-gradient-text drop-shadow-[var(--brand-shadow)]">
            {restaurantSettings?.name || t('menu.title')}
          </h1>
          {/* Subtitle intentionally removed as requested */}
        </div>

        {/* Happy Hours Banner */}
        {isHappyHour && (
          <div className="mb-8 animate-fade-in">
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/40 rounded-2xl p-6 backdrop-blur-sm animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="h-8 w-8 text-purple-400" />
                  <div>
                    <h2 className="text-3xl font-bold text-purple-300">Happy Hours Active! 🎉</h2>
                    <p className="text-purple-200 text-lg mt-1">Enjoy 15% OFF on all items (2:00 PM - 6:00 PM)</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-purple-500 text-white px-4 py-2 text-lg">
                  15% OFF
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Active Offers Banner */}
        {activeOffers.length > 0 && (
          <div className="mb-8 animate-fade-in">
            <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-3">
                <Sparkles className="h-6 w-6 text-amber-400" />
                <h2 className="text-2xl font-bold text-amber-300">Special Offers</h2>
              </div>
              <div className="grid gap-3">
                {activeOffers.map((offer) => (
                  <div key={offer.id} className="flex items-center justify-between bg-amber-900/30 p-3 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-amber-100">{offer.title}</h3>
                      {offer.description && (
                        <p className="text-amber-200/80 text-sm mt-1">{offer.description}</p>
                      )}
                    </div>
                    {/* Active text badge removed as requested */}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Search Bar */}
        <div className="mb-8 max-w-3xl mx-auto animate-fade-in">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-400" size={24} />
            <Input
              type="text"
              placeholder={t('menu.search.placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-14 pr-6 py-6 text-lg bg-gray-800 border-2 border-[hsl(var(--brand-from-hsl))]/50 text-white placeholder-cyan-300/70 rounded-2xl focus:border-[hsl(var(--brand-from-hsl))] focus:ring-4 focus:ring-[hsl(var(--brand-from-hsl))]/30 transition-all shadow-lg shadow-cyan-500/10"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <div className="mt-2 text-center text-cyan-300/80 text-sm">
            {searchQuery ? (
              <span>{t('menu.search.results', { query: searchQuery })}</span>
            ) : (
              <span>{t('menu.search.help')}</span>
            )}
          </div>
        </div>

        {/* Reviews section moved to end of menu as requested */}

        {/* Special Sections */}
        {groupedItems.chefSpecial.length > 0 && (
          <div className="mb-12 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <ChefHat className="h-8 w-8 text-purple-400" />
              <h2 className="text-3xl font-bold text-purple-300">{t('menu.chefSpecial.title')}</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {groupedItems.chefSpecial.map((item) => (
                <MenuCard 
                  key={item.id} 
                  name={item.name}
                  description={item.description || undefined}
                  price={formatPrice(item.price)}
                  happyHourPrice={isHappyHour ? formatPrice(getHappyHourPrice(item.price)) : undefined}
                  category={item.category}
                  imageUrl={item.image_url || undefined}
                  available={item.available}
                  modifiers={item.modifiers}
                  dietary_preferences={item.dietary_preferences}
                  seasonal={item.seasonal}
                  chef_special={item.chef_special}
                />
              ))}
            </div>
          </div>
        )}

        {groupedItems.seasonal.length > 0 && (
          <div className="mb-12 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <Leaf className="h-8 w-8 text-green-400" />
              <h2 className="text-3xl font-bold text-green-300">{t('menu.seasonal.title')}</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {groupedItems.seasonal.map((item) => (
                <MenuCard 
                  key={item.id} 
                  name={item.name}
                  description={item.description || undefined}
                  price={formatPrice(item.price)}
                  happyHourPrice={isHappyHour ? formatPrice(getHappyHourPrice(item.price)) : undefined}
                  category={item.category}
                  imageUrl={item.image_url || undefined}
                  available={item.available}
                  modifiers={item.modifiers}
                  dietary_preferences={item.dietary_preferences}
                  seasonal={item.seasonal}
                  chef_special={item.chef_special}
                />
              ))}
            </div>
          </div>
        )}

        {/* Category Tabs - FOOD and DRINKS only */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8 animate-fade-in">
          <TabsList className="grid w-full grid-cols-2 bg-black/40 border border-[hsl(var(--brand-from-hsl))]/40 p-2 rounded-2xl">
            <TabsTrigger 
              value="drinks" 
              className="text-2xl font-bold py-4 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-[hsl(var(--brand-from-hsl))] data-[state=active]:via-[hsl(var(--brand-via-hsl))] data-[state=active]:to-[hsl(var(--brand-to-hsl))] data-[state=active]:text-gray-900 data-[state=inactive]:text-cyan-300"
            >
              DRINKS
            </TabsTrigger>
            <TabsTrigger 
              value="food" 
              className="text-2xl font-bold py-4 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-[hsl(var(--brand-from-hsl))] data-[state=active]:via-[hsl(var(--brand-via-hsl))] data-[state=active]:to-[hsl(var(--brand-to-hsl))] data-[state=active]:text-gray-900 data-[state=inactive]:text-cyan-300"
            >
              FOOD
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Menu Items */}
        {renderMenuItems()}
      </div>

      {/* Brand Footer with Logo and Website Link */}
      <footer className="mt-8 border-t border-white/10 bg-black/30">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <a
            href="https://www.thelive.bar/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3"
            aria-label="Visit LIVE - Eat. Drink. Code. Repeat website"
          >
            <img
              src="/LIVE_Banner_TaglineRepeat_Fixed.jpg"
              alt="LIVE — Eat. Drink. Code. Repeat"
              className="h-16 sm:h-20 object-contain drop-shadow-[var(--brand-shadow)]"
            />
          </a>
          <a
            href="https://www.thelive.bar/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm sm:text-base text-cyan-300 hover:text-pink-300 transition-colors underline underline-offset-4"
          >
            thelive.bar
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Menu;
