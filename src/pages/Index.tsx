import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QrCode, Settings, Eye, BarChart3, ShieldCheck, Zap, Store, Globe, Star } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen py-12 px-4 bg-gradient-to-br from-gray-900 to-black text-white">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 brand-gradient-text">MenuX — Modern QR Menus</h1>
          <p className="text-white/80 text-lg md:text-xl mb-8">Launch digital menus in minutes. Engage customers. Get insights.</p>
          <div className="flex items-center justify-center gap-4">
            <Button size="lg" className="bg-gradient-to-r from-cyan-500 via-violet-500 to-pink-500 text-gray-900" onClick={() => navigate("/admin/login")}>Start Free Trial</Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/menu")}>
              View Menu
            </Button>
          </div>
          {/* Animated demo removed per request */}
        </div>

        {/* Social Proof */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 bg-white/5 border border-white/10">
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="text-white/80">Trusted by 1,000+ restaurants across India</span>
          </div>
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
            {/* Menu URL display removed per request */}
          </CardContent>
        </Card>

        {/* Feature Grid */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {[
            { icon: <Zap className="w-6 h-6 text-cyan-400" />, title: "Instant Setup", desc: "Create menus and QR codes in minutes" },
            { icon: <ShieldCheck className="w-6 h-6 text-pink-400" />, title: "Secure & Reliable", desc: "Built on Supabase with RLS" },
            { icon: <BarChart3 className="w-6 h-6 text-violet-400" />, title: "Analytics", desc: "Track scans, engagement, and top items" },
            { icon: <Store className="w-6 h-6 text-cyan-400" />, title: "Multi-Location", desc: "Manage menus across outlets" },
            { icon: <Globe className="w-6 h-6 text-pink-400" />, title: "Multi-language", desc: "Serve customers in their language" },
            { icon: <QrCode className="w-6 h-6 text-violet-400" />, title: "Beautiful QR", desc: "Brand-safe QR codes and landing" },
          ].map((f, i) => (
            <Card key={i} className="border-white/10 bg-black/30">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">{f.icon}<h3 className="font-bold">{f.title}</h3></div>
                <p className="text-white/70 text-sm">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pricing Section */}
        <div className="mt-16">
          <h2 className="text-4xl font-extrabold text-center brand-gradient-text mb-8">Pricing</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {/* FREEMIUM */}
            <Card className="border-white/10 bg-black/40">
              <CardContent className="p-6">
                <h3 className="text-2xl font-bold mb-2">FREEMIUM</h3>
                <p className="text-sm text-white/70 mb-4">Best for getting started</p>
                <ul className="space-y-2 text-sm text-white/80">
                  <li>• 1 menu</li>
                  <li>• 50 scans/month</li>
                  <li>• Branding enabled</li>
                </ul>
                <Button className="mt-6 w-full" variant="outline" onClick={() => navigate("/admin/login")}>Start Free</Button>
              </CardContent>
            </Card>
            {/* STARTER ₹99/mo */}
            <Card className="border-cyan-500/30 bg-black/40">
              <CardContent className="p-6">
                <h3 className="text-2xl font-bold mb-2">STARTER</h3>
                <p className="text-sm text-white/70 mb-4">₹99/mo</p>
                <ul className="space-y-2 text-sm text-white/80">
                  <li>• 3 menus</li>
                  <li>• Unlimited scans</li>
                  <li>• Remove branding</li>
                </ul>
                <Button className="mt-6 w-full bg-gradient-to-r from-cyan-500 via-violet-500 to-pink-500 text-gray-900" onClick={() => navigate("/admin/login")}>Choose Starter</Button>
              </CardContent>
            </Card>
            {/* GRAND ₹299/mo */}
            <Card className="border-violet-500/30 bg-black/40">
              <CardContent className="p-6">
                <h3 className="text-2xl font-bold mb-2">GRAND</h3>
                <p className="text-sm text-white/70 mb-4">₹299/mo</p>
                <ul className="space-y-2 text-sm text-white/80">
                  <li>• All features</li>
                  <li>• Analytics</li>
                  <li>• Multi-location</li>
                </ul>
                <Button className="mt-6 w-full" onClick={() => navigate("/admin/login")}>Choose Grand</Button>
              </CardContent>
            </Card>
            {/* PRO ₹599/mo */}
            <Card className="border-pink-500/30 bg-black/40">
              <CardContent className="p-6">
                <h3 className="text-2xl font-bold mb-2">PRO</h3>
                <p className="text-sm text-white/70 mb-4">₹599/mo</p>
                <ul className="space-y-2 text-sm text-white/80">
                  <li>• White-label</li>
                  <li>• API access</li>
                  <li>• Priority support</li>
                </ul>
                <Button className="mt-6 w-full" variant="outline" onClick={() => navigate("/admin/login")}>Choose Pro</Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 border-t border-white/10 pt-8">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm text-white/80">
            <a href="https://www.thelive.bar/privacy" target="_blank" rel="noopener noreferrer">Privacy</a>
            <a href="https://www.thelive.bar/terms" target="_blank" rel="noopener noreferrer">Terms</a>
            <a href="https://www.thelive.bar/blog" target="_blank" rel="noopener noreferrer">Blog</a>
            <a href="https://www.thelive.bar/help" target="_blank" rel="noopener noreferrer">Help Center</a>
          </div>
          <div className="mt-4 flex items-center gap-3 text-white/70">
            <span>Follow:</span>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">Twitter</a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">Instagram</a>
            <a href="https://www.thelive.bar/" target="_blank" rel="noopener noreferrer" className="hover:text-white">Website</a>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;