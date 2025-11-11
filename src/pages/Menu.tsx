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

  useEffect(() => {
    console.log("Menu component mounted");
    console.log("Search query state:", searchQuery);
  }, []);

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
    
    console.log("Search query:", searchQuery);
    const query = searchQuery.toLowerCase().trim();
    const filtered = menuItems.filter(item => 
      item.name.toLowerCase().includes(query) || 
      (item.description && item.description.toLowerCase().includes(query)) ||
      item.category.toLowerCase().includes(query)
    );
    console.log("Filtered items:", filtered);
    return filtered;
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const groupedCategories = searchQuery ? getFilteredGroupedCategories() : getGroupedCategories();
  const filteredMenuItems = getFilteredMenuItems();

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Restaurant Name Header */}
        <div className="mb-8 text-center animate-fade-in">
          <h1 className="text-5xl font-bold text-gradient mb-2">
            LIVE - FOOD and LIQUID LOUNGE
          </h1>
        </div>
        
        {/* Restaurant Header */}
        <div className="mb-8 animate-fade-in">
          {restaurantSettings?.logo_url ? (
            <div className="flex flex-col items-center">
              <img 
                src={restaurantSettings.logo_url} 
                alt={`${restaurantSettings.name} Logo`}
                className="h-24 w-auto object-contain mb-4"
              />
              <h1 className="text-4xl font-bold text-center text-gradient">
                {restaurantSettings.name}
              </h1>
            </div>
          ) : (
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-2 text-gradient">
                {restaurantSettings?.name || t("restaurant_menu")}
              </h1>
            </div>
          )}
        </div>
        
        <div className="text-center mb-12 animate-fade-in">
          <p className="text-muted-foreground text-lg">{t("discover_selection")}</p>
        </div>

        {/* Search Bar - Always visible */}
        <div className="mb-8 max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="text"
              placeholder={t("search_menu_items")}
              className="pl-10 pr-20 py-6 text-lg rounded-full border-2 border-primary/30 shadow-md focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setSearchQuery("")}
              >
                Clear
              </button>
            )}
          </div>
          <div className="text-center mt-2">
            <p className="text-sm text-muted-foreground">
              🔍 Search for items by name, description, or category
            </p>
          </div>
        </div>

        {/* Search Results Info */}
        {searchQuery && (
          <div className="mb-6 text-center">
            <p className="text-muted-foreground">
              {getFilteredMenuItems().length} {t("items_found_for")} "{searchQuery}"
            </p>
          </div>
        )}

        {/* Offers Section */}
        {offers.length > 0 && !searchQuery && (
          <div className="mb-12 animate-fade-in">
            <h2 className="text-3xl font-bold mb-6 text-center text-gradient">{t("special_offers")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {offers.map((offer) => (
                <div key={offer.id} className="border border-border rounded-lg p-6 bg-card shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-foreground">{offer.title}</h3>
                    <Badge variant="secondary" className="bg-green-500 text-white">
                      {t("special_offers")}
                    </Badge>
                  </div>
                  {offer.description && (
                    <p className="text-muted-foreground mb-4">{offer.description}</p>
                  )}
                  <div className="text-sm text-primary font-medium">
                    🎉 {t("limited_time_offer")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {menuItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">{t("no_items_available")}</p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Drinks Section */}
            {(groupedCategories.drinks.length > 0 || searchQuery) && (
              <section>
                <h2 className="text-3xl font-bold mb-6 text-foreground">
                  {searchQuery ? t("search_results") : t("drinks_beverages")}
                </h2>
                <Tabs defaultValue="all" className="w-full">
                  {!searchQuery && (
                    <TabsList className="grid w-full mb-8" style={{ gridTemplateColumns: `repeat(${Math.max(getFilteredSubCategories('drinks').length, 1)}, minmax(0, 1fr))` }}>
                      <TabsTrigger value="all" className="capitalize">{t("all_drinks")}</TabsTrigger>
                      {getFilteredSubCategories('drinks').map((category) => (
                        <TabsTrigger key={category} value={category} className="capitalize">
                          {category}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  )}
                  
                  <TabsContent value="all">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {getFilteredItemsByGroup('drinks')
                        .sort((a, b) => a.name.localeCompare(b.name))
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
                  
                  {!searchQuery && getFilteredSubCategories('drinks').map((category) => (
                    <TabsContent key={category} value={category}>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {getFilteredItemsByGroup('drinks')
                          .filter(item => item.category === category)
                          .sort((a, b) => a.name.localeCompare(b.name))
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
                  ))}
                </Tabs>
              </section>
            )}

            {/* Food Section */}
            {(groupedCategories.food.length > 0 || searchQuery) && (
              <section>
                <h2 className="text-3xl font-bold mb-6 text-foreground">
                  {searchQuery ? t("search_results") : t("food_menu")}
                </h2>
                <Tabs defaultValue="all" className="w-full">
                  {!searchQuery && (
                    <TabsList className="grid w-full mb-8" style={{ gridTemplateColumns: `repeat(${Math.max(getFilteredSubCategories('food').length, 1)}, minmax(0, 1fr))` }}>
                      <TabsTrigger value="all" className="capitalize">{t("all_food")}</TabsTrigger>
                      {getFilteredSubCategories('food').map((category) => (
                        <TabsTrigger key={category} value={category} className="capitalize">
                          {category}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  )}
                  
                  <TabsContent value="all">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {getFilteredItemsByGroup('food')
                        .sort((a, b) => a.name.localeCompare(b.name))
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
                  
                  {!searchQuery && getFilteredSubCategories('food').map((category) => (
                    <TabsContent key={category} value={category}>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {getFilteredItemsByGroup('food')
                          .filter(item => item.category === category)
                          .sort((a, b) => a.name.localeCompare(b.name))
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
                  ))}
                </Tabs>
              </section>
            )}

            {/* Other Categories (if any) */}
            {((groupedCategories.other.length > 0 && !searchQuery) || (searchQuery && groupedCategories.other.length > 0)) && (
              <section>
                <h2 className="text-3xl font-bold mb-6 text-foreground">
                  {searchQuery ? t("search_results") : t("other_items")}
                </h2>
                <Tabs defaultValue={groupedCategories.other[0] || "all"} className="w-full">
                  {!searchQuery && (
                    <TabsList className="grid w-full mb-8" style={{ gridTemplateColumns: `repeat(${groupedCategories.other.length || 1}, minmax(0, 1fr))` }}>
                      {groupedCategories.other.map((category) => (
                        <TabsTrigger key={category} value={category} className="capitalize">
                          {category}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  )}
                  
                  {groupedCategories.other.map((category) => (
                    <TabsContent key={category} value={category}>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {getFilteredItemsByGroup('other')
                          .filter((item) => item.category === category)
                          .sort((a, b) => a.name.localeCompare(b.name))
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
                  ))}
                </Tabs>
              </section>
            )}

            {/* No search results */}
            {searchQuery && filteredMenuItems.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">{t("no_search_results")}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;