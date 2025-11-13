import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChefHat, Leaf } from "lucide-react";

interface Modifier {
  id: string;
  name: string;
  price: number;
  max_selections?: number;
  required?: boolean;
}

interface MenuCardProps {
  name: string;
  description?: string;
  price: string; // Changed from number to string to accept formatted price
  happyHourPrice?: string; // Optional discounted price during happy hours
  isHappyHour?: boolean; // Flag to indicate if happy hour is active
  category: string;
  imageUrl?: string;
  available: boolean;
  modifiers?: Modifier[];
  dietary_preferences?: string[];
  seasonal?: boolean;
  chef_special?: boolean;
}

export const MenuCard = ({ 
  name, 
  description, 
  price,
  happyHourPrice,
  isHappyHour = false,
  category, 
  imageUrl, 
  available,
  modifiers,
  dietary_preferences,
  seasonal,
  chef_special
}: MenuCardProps) => {
  
  // Calculate happy hour price for modifiers (15% discount)
  const getHappyHourModifierPrice = (originalPrice: number) => {
    return isHappyHour ? (originalPrice * 0.85).toFixed(0) : originalPrice.toFixed(0);
  };
  
  return (
    <Card className="overflow-hidden bg-black border border-cyan-500/30 rounded-xl shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 touch-manipulation select-none active:scale-[0.99]">
      {imageUrl && (
        <div className="aspect-video w-full overflow-hidden bg-gray-900">
          <img 
            src={imageUrl} 
            alt={name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}
      <CardContent className="p-4 md:p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg md:text-xl font-bold text-white leading-tight">{name}</h3>
          {/* Hide the standalone price block when volume modifiers (e.g., 30ml/60ml/90ml) are present */}
          {(!modifiers || modifiers.length === 0) && (
            <div className="flex flex-col items-end">
              {happyHourPrice ? (
                <>
                  <span className="text-sm text-gray-400 line-through">{price}</span>
                  <span className="text-xl md:text-2xl font-bold text-purple-400">{happyHourPrice}</span>
                </>
              ) : (
                <span className="text-xl md:text-2xl font-bold text-cyan-400">{price}</span>
              )}
            </div>
          )}
        </div>
        {description && (
          <p className="text-gray-300 mb-4 text-sm md:text-base leading-relaxed">{description}</p>
        )}
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <Badge variant="secondary" className="text-xs md:text-sm bg-gray-800 text-cyan-300 border border-cyan-500/30 px-3 py-1">
            {category}
          </Badge>
          {happyHourPrice && (
            <Badge variant="secondary" className="text-xs md:text-sm bg-purple-900/50 text-purple-300 border border-purple-500/30 px-3 py-1 animate-pulse">
              Happy Hour 15% OFF
            </Badge>
          )}
          {!available && (
            <Badge variant="destructive" className="text-xs md:text-sm px-3 py-1">
              Unavailable
            </Badge>
          )}
          {seasonal && (
            <Badge variant="secondary" className="text-xs md:text-sm bg-green-900/50 text-green-300 border border-green-500/30 px-3 py-1">
              <Leaf className="h-3 w-3 mr-1 inline" />
              Seasonal
            </Badge>
          )}
          {chef_special && (
            <Badge variant="secondary" className="text-xs md:text-sm bg-purple-900/50 text-purple-300 border border-purple-500/30 px-3 py-1">
              <ChefHat className="h-3 w-3 mr-1 inline" />
              Chef's Special
            </Badge>
          )}
        </div>
        
        {/* Dietary Preferences */}
        {dietary_preferences && dietary_preferences.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {dietary_preferences.map((preference, index) => (
              <Badge 
                key={`${preference}-${index}`}
                variant="outline" 
                className="text-xs bg-blue-900/30 text-blue-300 border border-blue-500/30 px-2 py-0.5"
              >
                {preference}
              </Badge>
            ))}
          </div>
        )}
        
        {/* Volume/Size Options */}
        {modifiers && modifiers.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-700">
            <p className="text-xs text-gray-400 mb-2">Available Sizes</p>
            <div className="grid grid-cols-3 gap-2">
              {modifiers.map((modifier, idx) => (
                <div 
                  key={modifier.id || `${modifier.name}-${idx}`} 
                  className="bg-gray-800/50 border border-cyan-500/30 rounded-lg p-2 text-center hover:border-cyan-500/60 transition-colors"
                >
                  <p className="text-xs font-semibold text-cyan-300">{modifier.name}</p>
                  {isHappyHour ? (
                    <div className="mt-1">
                      <p className="text-xs text-gray-400 line-through">₹{modifier.price}</p>
                      <p className="text-sm font-bold text-purple-400">₹{getHappyHourModifierPrice(modifier.price)}</p>
                    </div>
                  ) : (
                    <p className="text-sm font-bold text-white mt-1">₹{modifier.price}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};