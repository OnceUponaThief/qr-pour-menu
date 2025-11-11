import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { MenuCard } from "@/components/MenuCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/currency";

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  image_url: string | null;
  available: boolean;
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
  drinks: ["drinks", "cocktails", "beer", "wine", "whiskey", "vodka", "gin", "rum", "brandy"],
  food: ["food", "appetizers", "soup", "main course", "rice", "noodles", "dal", "bread", "desserts"],
};

const Menu = () => {
  const { t, i18n } = useTranslation();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [restaurantSettings, setRestaurantSettings] = useState<RestaurantSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

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
        setMenuItems(data);
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

  // Filter menu items based on search query
  const getFilteredMenuItems = () => {
    if (!searchQuery) return menuItems;
    
    const query = searchQuery.toLowerCase().trim();
    return menuItems.filter(item => 
      item.name.toLowerCase().includes(query) || 
      (item.description && item.description.toLowerCase().includes(query)) ||
      item.category.toLowerCase().includes(query)
    );
  };

  // Group filtered categories for tab display
  const getFilteredGroupedCategories = () => {
    const filteredItems = getFilteredMenuItems();
    const grouped: Record<string, string[]> = {
      drinks: [],
      food: [],
      other: [],
    };

    const uniqueCategories = Array.from(new Set(filteredItems.map((item) => item.category)));
    
    uniqueCategories.forEach((category) => {
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

  // Filter items by group based on search query
  const getFilteredItemsByGroup = (group: string) => {
    const filteredItems = getFilteredMenuItems();
    
    if (!searchQuery) {
      // When there's no search query, use the original menu items and grouping
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
    } else {
      // When there's a search query, use the filtered items and grouping
      const groupedCategories = getFilteredGroupedCategories();
      const groupCategories = groupedCategories[group as keyof typeof groupedCategories] || [];
      
      if (group === "other") {
        // For "other" group, include all categories not in drinks or food
        const allGroupedCategories = [...groupedCategories.drinks, ...groupedCategories.food];
        return filteredItems.filter(item => !allGroupedCategories.includes(item.category));
      }
      
      return filteredItems.filter(item => 
        groupCategories.some(cat => cat === item.category)
      );
    }
  };

  // Get unique categories within a group for sub-tabs based on search query
  const getFilteredSubCategories = (group: string) => {
    const items = getFilteredItemsByGroup(group);
    return Array.from(new Set(items.map(item => item.category)));
  };

  const groupedCategories = searchQuery ? getFilteredGroupedCategories() : getGroupedCategories();
  const filteredMenuItems = getFilteredMenuItems();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 bg-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Restaurant Header */}
        <div className="mb-8 md:mb-12 animate-fade-in">
          {restaurantSettings?.logo_url ? (
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-500/20 blur-3xl rounded-full"></div>
                <img 
                  src={restaurantSettings.logo_url} 
                  alt={`${restaurantSettings.name} Logo`}
                  className="h-20 md:h-32 w-auto object-contain relative z-10 drop-shadow-2xl"
                />
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-center text-white">
                {restaurantSettings.name}
              </h1>
            </div>
          ) : (
            <div className="text-center">
              <h1 className="text-3xl md:text-5xl font-bold mb-2 text-white">
                {restaurantSettings?.name || t("restaurant_menu")}
              </h1>
            </div>
          )}
        </div>

        {/* Enhanced Search Bar */}
        <div className="mb-8 max-w-3xl mx-auto animate-fade-in">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-400" size={24} />
            <Input
              type="text"
              placeholder="Search menu items, categories, or descriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-14 pr-6 py-6 text-lg bg-gray-800 border-2 border-cyan-500/50 text-white placeholder-cyan-300/70 rounded-2xl focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/30 transition-all shadow-lg shadow-cyan-500/10"
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
              <span>Showing results for "{searchQuery}"</span>
            ) : (
              <span>Search for items by name, category, or description</span>
            )}
          </div>
        </div>

        {/* Active Offers */}
        {offers.filter(offer => offer.is_active).length > 0 && (
          <div className="mb-8 animate-fade-in">
            <div className="bg-gray-800 border border-cyan-500/30 rounded-xl overflow-hidden">
              <div className="bg-gray-900 border-b border-cyan-500/30 p-4">
                <h2 className="text-2xl font-bold text-cyan-400 flex items-center gap-2">
                  <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
                  {t("offers_and_promotions")}
                </h2>
              </div>
              <div className="p-4 space-y-3">
                {offers.filter(offer => offer.is_active).map((offer) => (
                  <div key={offer.id} className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg border border-pink-500/30">
                    <div className="flex-shrink-0 w-3 h-3 bg-pink-500 rounded-full animate-pulse"></div>
                    <div>
                      <h3 className="font-bold text-pink-300">{offer.title}</h3>
                      {offer.description && (
                        <p className="text-sm text-gray-300 mt-1">{offer.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Menu Tabs */}
        <Tabs defaultValue="all" className="animate-fade-in">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 mb-8 bg-gray-800 border border-cyan-500/30 rounded-xl p-1">
            <TabsTrigger 
              value="all" 
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300 data-[state=active]:border-cyan-400 border border-transparent rounded-lg transition-all"
            >
              {t("all")}
            </TabsTrigger>
            <TabsTrigger 
              value="drinks" 
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300 data-[state=active]:border-cyan-400 border border-transparent rounded-lg transition-all"
            >
              {t("drinks")}
            </TabsTrigger>
            <TabsTrigger 
              value="food" 
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300 data-[state=active]:border-cyan-400 border border-transparent rounded-lg transition-all"
            >
              {t("food")}
            </TabsTrigger>
            <TabsTrigger 
              value="desserts" 
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300 data-[state=active]:border-cyan-400 border border-transparent rounded-lg transition-all"
            >
              {t("desserts")}
            </TabsTrigger>
            <TabsTrigger 
              value="specials" 
              className="data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-300 data-[state=active]:border-pink-400 border border-transparent rounded-lg transition-all"
            >
              {t("specials")}
            </TabsTrigger>
          </TabsList>

          {/* All Items Tab */}
          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getFilteredMenuItems().map((item) => (
                <MenuCard
                  key={item.id}
                  name={item.name}
                  description={item.description || undefined}
                  price={formatPrice(item.price)}
                  category={item.category}
                  imageUrl={item.image_url || undefined}
                  available={item.available}
                />
              ))}
            </div>
          </TabsContent>

          {/* Drinks Tab */}
          <TabsContent value="drinks" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getFilteredMenuItems()
                .filter(item => 
                  CATEGORY_GROUPS.drinks.some(cat => 
                    item.category.toLowerCase().includes(cat) || item.category.toLowerCase() === cat
                  )
                )
                .map((item) => (
                  <MenuCard
                    key={item.id}
                    name={item.name}
                    description={item.description || undefined}
                    price={formatPrice(item.price)}
                    category={item.category}
                    imageUrl={item.image_url || undefined}
                    available={item.available}
                  />
                ))}
            </div>
          </TabsContent>

          {/* Food Tab */}
          <TabsContent value="food" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getFilteredMenuItems()
                .filter(item => 
                  CATEGORY_GROUPS.food.some(cat => 
                    item.category.toLowerCase().includes(cat) || item.category.toLowerCase() === cat
                  )
                )
                .map((item) => (
                  <MenuCard
                    key={item.id}
                    name={item.name}
                    description={item.description || undefined}
                    price={formatPrice(item.price)}
                    category={item.category}
                    imageUrl={item.image_url || undefined}
                    available={item.available}
                  />
                ))}
            </div>
          </TabsContent>

          {/* Desserts Tab */}
          <TabsContent value="desserts" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getFilteredMenuItems()
                .filter(item => item.category.toLowerCase().includes("dessert"))
                .map((item) => (
                  <MenuCard
                    key={item.id}
                    name={item.name}
                    description={item.description || undefined}
                    price={formatPrice(item.price)}
                    category={item.category}
                    imageUrl={item.image_url || undefined}
                    available={item.available}
                  />
                ))}
            </div>
          </TabsContent>

          {/* Specials Tab */}
          <TabsContent value="specials" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getFilteredMenuItems()
                .filter(item => !item.available) // Using unavailable items as specials for demo
                .map((item) => (
                  <MenuCard
                    key={item.id}
                    name={item.name}
                    description={item.description || undefined}
                    price={formatPrice(item.price)}
                    category={item.category}
                    imageUrl={item.image_url || undefined}
                    available={item.available}
                  />
                ))}
            </div>
          </TabsContent>
        </Tabs>

        {getFilteredMenuItems().length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">{t("no_items_found")}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;