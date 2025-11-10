import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MenuCard } from "@/components/MenuCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

const Menu = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([fetchMenuItems(), fetchOffers()]);
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
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 animate-fade-in">
          <img 
            src="/LIVE_Banner.svg" 
            alt="LIVE Bar & Restaurant Banner"
            className="w-full h-auto rounded-lg shadow-lg"
          />
        </div>
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl font-bold mb-4 text-gradient">Bar Menu</h1>
          <p className="text-muted-foreground text-lg">Discover our selection of drinks and food</p>
        </div>

        {/* Offers Section */}
        {offers.length > 0 && (
          <div className="mb-12 animate-fade-in">
            <h2 className="text-3xl font-bold mb-6 text-center text-gradient">Special Offers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {offers.map((offer) => (
                <div key={offer.id} className="border border-border rounded-lg p-6 bg-card shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-foreground">{offer.title}</h3>
                    <Badge variant="secondary" className="bg-green-500 text-white">
                      Special Offer
                    </Badge>
                  </div>
                  {offer.description && (
                    <p className="text-muted-foreground mb-4">{offer.description}</p>
                  )}
                  <div className="text-sm text-primary font-medium">
                    🎉 Limited Time Offer
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {menuItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No menu items available at the moment.</p>
          </div>
        ) : (
          <Tabs defaultValue={categories[0] || "all"} className="w-full">
            <TabsList className="grid w-full mb-8" style={{ gridTemplateColumns: `repeat(${categories.length || 1}, minmax(0, 1fr))` }}>
              {categories.map((category) => (
                <TabsTrigger key={category} value={category} className="capitalize">
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map((category) => (
              <TabsContent key={category} value={category}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {menuItems
                    .filter((item) => item.category === category)
                    .map((item) => (
                      <MenuCard
                        key={item.id}
                        name={item.name}
                        description={item.description || undefined}
                        price={item.price}
                        category={item.category}
                        imageUrl={item.image_url || undefined}
                        available={item.available}
                      />
                    ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default Menu;