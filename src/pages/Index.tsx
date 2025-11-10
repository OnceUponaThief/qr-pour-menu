import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QrCode, Settings, Eye } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-6xl font-bold mb-4 text-gradient">Scan to View Menu</h1>
          <p className="text-muted-foreground text-xl mb-8">
            Digital menu system for modern bars and restaurants
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="border-border bg-card card-glow animate-fade-in hover:scale-105 transition-transform duration-300">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Eye className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-4">View Menu</h2>
              <p className="text-muted-foreground mb-6">
                Browse our current menu as a customer
              </p>
              <Button onClick={() => navigate("/menu")} className="w-full" size="lg">
                View Menu
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border bg-card card-glow animate-fade-in hover:scale-105 transition-transform duration-300">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Settings className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Admin Access</h2>
              <p className="text-muted-foreground mb-6">
                Manage menu items and settings
              </p>
              <Button onClick={() => navigate("/admin/login")} className="w-full" size="lg">
                Admin Login
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border bg-card animate-fade-in">
          <CardContent className="p-8">
            <h2 className="text-3xl font-bold mb-6 text-center text-gradient">How It Works</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <Badge className="w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto text-lg">
                  1
                </Badge>
                <h3 className="font-bold mb-2">Print or Display</h3>
                <p className="text-sm text-muted-foreground">
                  Click "Print" to print QR codes for each table, or "Download" to save as an image for digital display
                </p>
              </div>
              <div className="text-center">
                <Badge className="w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto text-lg">
                  2
                </Badge>
                <h3 className="font-bold mb-2">Place on Tables</h3>
                <p className="text-sm text-muted-foreground">
                  Position the QR code on each table or at the bar entrance for easy customer access
                </p>
              </div>
              <div className="text-center">
                <Badge className="w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto text-lg">
                  3
                </Badge>
                <h3 className="font-bold mb-2">Customers Scan</h3>
                <p className="text-sm text-muted-foreground">
                  Customers scan the code with their phone camera to instantly access the digital menu
                </p>
              </div>
              <div className="text-center">
                <Badge className="w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto text-lg">
                  4
                </Badge>
                <h3 className="font-bold mb-2">Browse & Order</h3>
                <p className="text-sm text-muted-foreground">
                  Customers can browse items, add to cart, and place orders directly from their device
                </p>
              </div>
            </div>
            <div className="mt-8 p-6 bg-secondary rounded-lg">
              <h3 className="font-bold mb-2">Menu URL</h3>
              <code className="text-sm text-primary break-all">
                {window.location.origin}/menu
              </code>
              <p className="text-xs text-muted-foreground mt-2">
                This URL is embedded in the QR code above
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
