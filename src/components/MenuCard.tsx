import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface MenuCardProps {
  name: string;
  description?: string;
  price: number;
  category: string;
  imageUrl?: string;
  available: boolean;
}

export const MenuCard = ({ name, description, price, category, imageUrl, available }: MenuCardProps) => {
  return (
    <Card className="overflow-hidden border-border bg-card hover:card-glow transition-all duration-300 animate-fade-in">
      {imageUrl && (
        <div className="aspect-video w-full overflow-hidden bg-muted">
          <img 
            src={imageUrl} 
            alt={name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-foreground">{name}</h3>
          <span className="text-primary text-xl font-bold">₹{price.toFixed(2)}</span>
        </div>
        {description && (
          <p className="text-muted-foreground mb-3 text-sm">{description}</p>
        )}
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
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