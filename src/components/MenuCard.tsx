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
    <Card className="overflow-hidden glass-card border-border/50 card-glow-hover animate-fade-in">
      {imageUrl && (
        <div className="aspect-video w-full overflow-hidden bg-muted/40 backdrop-blur-sm">
          <img 
            src={imageUrl} 
            alt={name}
            className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
          />
        </div>
      )}
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-foreground">{name}</h3>
          <span className="text-primary text-xl font-bold drop-shadow-[0_0_10px_rgba(251,146,60,0.5)]">{price}</span>
        </div>
        {description && (
          <p className="text-muted-foreground mb-3 text-sm leading-relaxed">{description}</p>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="text-xs backdrop-blur-sm bg-secondary/80">
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