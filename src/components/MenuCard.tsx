import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface MenuCardProps {
  name: string;
  description?: string;
  price: string; // Changed from number to string to accept formatted price
  category: string;
  imageUrl?: string;
  available: boolean;
}

export const MenuCard = ({ name, description, price, category, imageUrl, available }: MenuCardProps) => {
  return (
    <Card className="overflow-hidden bg-black border border-cyan-500/30 rounded-xl shadow-lg hover:shadow-cyan-500/20 transition-all duration-300">
      {imageUrl && (
        <div className="aspect-video w-full overflow-hidden bg-gray-900">
          <img 
            src={imageUrl} 
            alt={name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-white">{name}</h3>
          <span className="text-xl font-bold text-cyan-400">{price}</span>
        </div>
        {description && (
          <p className="text-gray-300 mb-3 text-sm leading-relaxed">{description}</p>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="text-xs bg-gray-800 text-cyan-300 border border-cyan-500/30">
            {category}
          </Badge>
          {!available && (
            <Badge variant="destructive" className="text-xs">
              Unavailable
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};