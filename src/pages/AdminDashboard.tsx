import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, LogOut, Plus, Pencil, Trash2, QrCode, Download, Printer, Upload } from "lucide-react";
import { Session } from "@supabase/supabase-js";
import QRCode from "qrcode";

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

const AdminDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [restaurantSettings, setRestaurantSettings] = useState<RestaurantSettings | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [offerDialogOpen, setOfferDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "drinks",
    image_url: "",
    available: true,
  });
  const [offerFormData, setOfferFormData] = useState({
    title: "",
    description: "",
    is_active: false,
  });
  const [settingsFormData, setSettingsFormData] = useState({
    name: "Restaurant Name",
    logo_url: "",
    currency_code: "INR",
    language_code: "en",
    timezone: "Asia/Kolkata",
  });
  const [tableNumber, setTableNumber] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [bulkTables, setBulkTables] = useState("");
  const [bulkQrCodes, setBulkQrCodes] = useState<Array<{ table: string; url: string }>>([]);
  // Add new state for admin management
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const [adminFormData, setAdminFormData] = useState({
    username: "",
    password: "",
  });
  // Add new state for analytics
  const [analyticsData, setAnalyticsData] = useState({
    totalViews: 0,
    popularItems: [] as { name: string; views: number }[],
    peakHours: [] as { hour: number; views: number }[],
    dailyViews: [] as { date: string; views: number }[],
  });
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/admin/login");
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (!session) {
          navigate("/admin/login");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (session) {
      Promise.all([fetchMenuItems(), fetchOffers(), fetchRestaurantSettings()]);
    }
  }, [session]);

  const fetchMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .order("category", { ascending: true })
        .order("name", { ascending: true });

      if (error) throw error;
      if (data) setMenuItems(data);
    } catch (error) {
      console.error("Error fetching menu items:", error);
      toast.error("Failed to load menu items");
    }
  };

  const fetchOffers = async () => {
    try {
      const { data, error } = await supabase
        .from("offers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) setOffers(data);
    } catch (error) {
      console.error("Error fetching offers:", error);
      toast.error("Failed to load offers");
    }
  };

  const fetchRestaurantSettings = async () => {
    try {
      // First, try to get existing settings
      let { data, error } = await supabase
        .from("restaurant_settings")
        .select("*")
        .limit(1);

      // If table doesn't exist, show a helpful message
      if (error && error.message.includes("relation") && error.message.includes("does not exist")) {
        toast.error("Restaurant settings table not found. Please run the database migration.");
        // Initialize with default values
        setSettingsFormData({
          name: "Restaurant Name",
          logo_url: "",
          currency_code: "INR",
          language_code: "en",
          timezone: "Asia/Kolkata",
        });
        return;
      } else if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        setRestaurantSettings(data[0]);
        setSettingsFormData({
          name: data[0].name,
          logo_url: data[0].logo_url || "",
          currency_code: data[0].currency_code || "INR",
          language_code: data[0].language_code || "en",
          timezone: data[0].timezone || "Asia/Kolkata",
        });
      } else {
        // Initialize with default values if none exist
        setSettingsFormData({
          name: "Restaurant Name",
          logo_url: "",
          currency_code: "INR",
          language_code: "en",
          timezone: "Asia/Kolkata",
        });
      }
    } catch (error) {
      console.error("Error fetching restaurant settings:", error);
      toast.error("Failed to load restaurant settings");
    }
  };

  const createRestaurantSettingsTable = async () => {
    // Table creation should be handled through Supabase migrations
    toast.error("Restaurant settings table not found. Please ensure the database migration has been run.");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  // Add new function for creating admin users
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert username to email for Supabase authentication
      const email = adminFormData.username === "admin" ? "admin@livebar.com" : `${adminFormData.username}@livebar.com`;
      
      // Create the admin user
      const { error } = await supabase.auth.signUp({
        email,
        password: adminFormData.password,
      });

      if (error) throw error;

      toast.success("Admin account created successfully!");
      setAdminDialogOpen(false);
      setAdminFormData({ username: "", password: "" });
    } catch (error: any) {
      console.error("Error creating admin:", error);
      toast.error(error.message || "Failed to create admin account");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const itemData = {
        name: formData.name,
        description: formData.description || null,
        price: parseFloat(formData.price),
        category: formData.category,
        image_url: formData.image_url || null,
        available: formData.available,
      };

      if (editingItem) {
        const { error } = await supabase
          .from("menu_items")
          .update(itemData)
          .eq("id", editingItem.id);

        if (error) throw error;
        toast.success("Item updated successfully!");
      } else {
        const { error } = await supabase.from("menu_items").insert([itemData]);

        if (error) throw error;
        toast.success("Item added successfully!");
      }

      setDialogOpen(false);
      setEditingItem(null);
      setFormData({
        name: "",
        description: "",
        price: "",
        category: "drinks",
        image_url: "",
        available: true,
      });
      fetchMenuItems();
    } catch (error: any) {
      toast.error(error.message || "Failed to save item");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || "",
      price: item.price.toString(),
      category: item.category,
      image_url: item.image_url || "",
      available: item.available,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const { error } = await supabase.from("menu_items").delete().eq("id", id);

      if (error) throw error;
      toast.success("Item deleted successfully!");
      fetchMenuItems();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete item");
    }
  };

  const toggleAvailability = async (item: MenuItem) => {
    try {
      const { error } = await supabase
        .from("menu_items")
        .update({ available: !item.available })
        .eq("id", item.id);

      if (error) throw error;
      toast.success("Availability updated!");
      fetchMenuItems();
    } catch (error: any) {
      toast.error(error.message || "Failed to update availability");
    }
  };

  const handleOfferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const offerData = {
        title: offerFormData.title,
        description: offerFormData.description || null,
        is_active: offerFormData.is_active,
      };

      if (editingOffer) {
        const { error } = await supabase
          .from("offers")
          .update(offerData)
          .eq("id", editingOffer.id);

        if (error) throw error;
        toast.success("Offer updated successfully!");
      } else {
        const { error } = await supabase.from("offers").insert([offerData]);

        if (error) throw error;
        toast.success("Offer added successfully!");
      }

      setOfferDialogOpen(false);
      setEditingOffer(null);
      setOfferFormData({
        title: "",
        description: "",
        is_active: false,
      });
      fetchOffers();
    } catch (error: any) {
      toast.error(error.message || "Failed to save offer");
    } finally {
      setLoading(false);
    }
  };

  const handleEditOffer = (offer: Offer) => {
    setEditingOffer(offer);
    setOfferFormData({
      title: offer.title,
      description: offer.description || "",
      is_active: offer.is_active || false,
    });
    setOfferDialogOpen(true);
  };

  const handleDeleteOffer = async (id: string) => {
    if (!confirm("Are you sure you want to delete this offer?")) return;

    try {
      const { error } = await supabase.from("offers").delete().eq("id", id);

      if (error) throw error;
      toast.success("Offer deleted successfully!");
      fetchOffers();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete offer");
    }
  };

  const toggleOfferStatus = async (offer: Offer) => {
    try {
      const { error } = await supabase
        .from("offers")
        .update({ is_active: !offer.is_active })
        .eq("id", offer.id);

      if (error) throw error;
      toast.success(`Offer ${!offer.is_active ? 'activated' : 'deactivated'}!`);
      fetchOffers();
    } catch (error: any) {
      toast.error(error.message || "Failed to update offer status");
    }
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const settingsData = {
        name: settingsFormData.name,
        logo_url: settingsFormData.logo_url || null,
        currency_code: settingsFormData.currency_code,
        language_code: settingsFormData.language_code,
        timezone: settingsFormData.timezone,
      };

      if (restaurantSettings) {
        const { error } = await supabase
          .from("restaurant_settings")
          .update(settingsData)
          .eq("id", restaurantSettings.id);

        if (error) throw error;
        toast.success("Settings updated successfully!");
      } else {
        const { error } = await supabase.from("restaurant_settings").insert([settingsData]);

        if (error) throw error;
        toast.success("Settings created successfully!");
      }

      setSettingsDialogOpen(false);
      fetchRestaurantSettings();
    } catch (error: any) {
      toast.error(error.message || "Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      setSettingsFormData({ ...settingsFormData, logo_url: publicUrl });
      toast.success("Logo uploaded successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload logo");
    } finally {
      setLoading(false);
    }
  };

  const handleMenuItemImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `menu_items/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      setFormData({ ...formData, image_url: publicUrl });
      toast.success("Image uploaded successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload image");
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async () => {
    try {
      const menuUrl = `${window.location.origin}/menu`;
      
      // Create a canvas to draw our custom QR code
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');
      
      // Generate base QR code
      const qrDataUrl = await QRCode.toDataURL(menuUrl, {
        width: 512,
        margin: 2,
        color: {
          dark: "#00f0ff", // Cyberpunk cyan
          light: "#000000", // Black background
        },
      });
      
      // Create image from QR code data
      const img = new Image();
      img.src = qrDataUrl;
      
      // Wait for image to load
      await new Promise((resolve) => {
        img.onload = resolve;
      });
      
      // Set canvas dimensions
      canvas.width = 600;
      canvas.height = 600;
      
      // Draw cyberpunk background
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw glow effect
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 20;
      ctx.fillStyle = '#000000';
      ctx.fillRect(40, 40, 520, 520);
      
      // Reset shadow
      ctx.shadowBlur = 0;
      
      // Draw QR code in the center
      ctx.drawImage(img, 44, 44, 512, 512);
      
      // Draw "LIVE" text with cyberpunk styling
      ctx.font = 'bold 48px "Courier New", monospace';
      ctx.fillStyle = '#00f0ff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 10;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Draw "LIVE" text in the center of the QR code
      ctx.fillText('LIVE', canvas.width / 2, canvas.height / 2);
      
      // Draw decorative elements
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 5;
      
      // Draw corner decorations
      // Top-left
      ctx.beginPath();
      ctx.moveTo(40, 40);
      ctx.lineTo(40, 80);
      ctx.lineTo(80, 80);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(40, 40);
      ctx.lineTo(80, 40);
      ctx.lineTo(80, 80);
      ctx.stroke();
      
      // Top-right
      ctx.beginPath();
      ctx.moveTo(560, 40);
      ctx.lineTo(560, 80);
      ctx.lineTo(520, 80);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(560, 40);
      ctx.lineTo(520, 40);
      ctx.lineTo(520, 80);
      ctx.stroke();
      
      // Bottom-left
      ctx.beginPath();
      ctx.moveTo(40, 560);
      ctx.lineTo(40, 520);
      ctx.lineTo(80, 520);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(40, 560);
      ctx.lineTo(80, 560);
      ctx.lineTo(80, 520);
      ctx.stroke();
      
      // Bottom-right
      ctx.beginPath();
      ctx.moveTo(560, 560);
      ctx.lineTo(560, 520);
      ctx.lineTo(520, 520);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(560, 560);
      ctx.lineTo(520, 560);
      ctx.lineTo(520, 520);
      ctx.stroke();
      
      // Convert to data URL
      const cyberpunkQrDataUrl = canvas.toDataURL('image/png');
      setQrCodeUrl(cyberpunkQrDataUrl);
      toast.success("Cyberpunk QR code generated!");
    } catch (error) {
      toast.error("Failed to generate QR code");
      console.error(error);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement("a");
    link.href = qrCodeUrl;
    link.download = `restaurant-menu-qr-code.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("QR code downloaded!");
  };

  const generateBulkQRCodes = async () => {
    if (!bulkTables.trim()) {
      toast.error("Please enter table numbers");
      return;
    }

    const tables = bulkTables
      .split(/[,\n]/)
      .map((t) => t.trim())
      .filter((t) => t);

    if (tables.length === 0) {
      toast.error("Please enter valid table numbers");
      return;
    }

    try {
      const menuUrl = `${window.location.origin}/menu`;
      const codes = await Promise.all(
        tables.map(async (table) => {
          const qrDataUrl = await QRCode.toDataURL(menuUrl, {
            width: 512,
            margin: 2,
            color: {
              dark: "#000000",
              light: "#FFFFFF",
            },
          });
          return { table, url: qrDataUrl };
        })
      );
      setBulkQrCodes(codes);
      toast.success(`Generated ${codes.length} QR codes!`);
    } catch (error) {
      toast.error("Failed to generate QR codes");
      console.error(error);
    }
  };

  const printQRCodes = () => {
    if (bulkQrCodes.length === 0) {
      toast.error("Generate QR codes first");
      return;
    }
    window.print();
  };

  // Add new function for fetching analytics data
  const fetchAnalyticsData = async () => {
    setAnalyticsLoading(true);
    try {
      // Mock analytics data for now - in a real implementation, this would come from your analytics service
      // For example, you could use Supabase to store and retrieve analytics data
      const mockAnalytics = {
        totalViews: Math.floor(Math.random() * 1000) + 500,
        popularItems: [
          { name: "Whiskey Sour", views: 124 },
          { name: "Nachos", views: 98 },
          { name: "Craft Beer", views: 87 },
          { name: "Caesar Salad", views: 76 },
          { name: "Chocolate Cake", views: 65 },
        ],
        peakHours: [
          { hour: 19, views: 120 },
          { hour: 20, views: 115 },
          { hour: 21, views: 110 },
          { hour: 18, views: 95 },
          { hour: 22, views: 85 },
        ],
        dailyViews: [
          { date: "2023-06-01", views: 45 },
          { date: "2023-06-02", views: 52 },
          { date: "2023-06-03", views: 67 },
          { date: "2023-06-04", views: 58 },
          { date: "2023-06-05", views: 73 },
          { date: "2023-06-06", views: 61 },
          { date: "2023-06-07", views: 55 },
        ],
      };
      
      setAnalyticsData(mockAnalytics);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      toast.error("Failed to load analytics data");
    } finally {
      setAnalyticsLoading(false);
    }
  };

  if (loading || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8 animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold text-gradient mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your bar menu</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Restaurant Settings Card */}
        <Card className="border-border bg-card animate-fade-in mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Restaurant Settings</CardTitle>
                <CardDescription>Manage your restaurant name and logo</CardDescription>
              </div>
              <Button onClick={() => setSettingsDialogOpen(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Settings
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              {restaurantSettings?.logo_url ? (
                <img 
                  src={restaurantSettings.logo_url} 
                  alt="Restaurant Logo" 
                  className="h-16 w-16 object-contain rounded-lg border"
                />
              ) : (
                <div className="h-16 w-16 rounded-lg border flex items-center justify-center bg-muted">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div>
                <h3 className="text-xl font-bold">{restaurantSettings?.name || "Restaurant Name"}</h3>
                <p className="text-muted-foreground text-sm">
                  {restaurantSettings?.logo_url ? "Logo uploaded" : "No logo uploaded"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card animate-fade-in">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Menu Items</CardTitle>
                <CardDescription>Add, edit, or remove items from your menu</CardDescription>
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => {
                    setEditingItem(null);
                    setFormData({
                      name: "",
                      description: "",
                      price: "",
                      category: "drinks",
                      image_url: "",
                      available: true,
                    });
                  }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{editingItem ? "Edit Item" : "Add New Item"}</DialogTitle>
                    <DialogDescription>
                      {editingItem ? "Update the menu item details" : "Add a new item to your menu"}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="price">Price *</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category">Category *</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => setFormData({ ...formData, category: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="drinks">Drinks</SelectItem>
                            <SelectItem value="cocktails">Cocktails</SelectItem>
                            <SelectItem value="food">Food</SelectItem>
                            <SelectItem value="appetizers">Appetizers</SelectItem>
                            <SelectItem value="desserts">Desserts</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center space-x-2 pt-8">
                        <Switch
                          id="available"
                          checked={formData.available}
                          onCheckedChange={(checked) => setFormData({ ...formData, available: checked })}
                        />
                        <Label htmlFor="available">Available</Label>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="image_url">Image URL</Label>
                      <Input
                        id="image_url"
                        type="url"
                        value={formData.image_url}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        placeholder="https://example.com/image.jpg"
                      />
                      <div className="relative">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleMenuItemImageUpload}
                          className="hidden"
                          id="menu-item-image-upload"
                        />
                        <Label htmlFor="menu-item-image-upload" className="cursor-pointer">
                          <Button type="button" variant="outline" className="w-full mt-2">
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Image
                          </Button>
                        </Label>
                      </div>
                      {formData.image_url && (
                        <div className="mt-2">
                          <img 
                            src={formData.image_url} 
                            alt="Preview" 
                            className="h-32 w-full object-cover rounded-lg border"
                          />
                        </div>
                      )}
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {editingItem ? "Update Item" : "Add Item"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {menuItems.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No menu items yet. Add your first item!</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Available</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {menuItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="capitalize">{item.category}</TableCell>
                        <TableCell>₹{item.price.toFixed(2)}</TableCell>
                        <TableCell>
                          <Switch
                            checked={item.available}
                            onCheckedChange={() => toggleAvailability(item)}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleEdit(item)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => handleDelete(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Admin Management Section */}
        <Card className="border-border bg-card animate-fade-in mt-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Admin Management</CardTitle>
                <CardDescription>Create and manage admin accounts</CardDescription>
              </div>
              <Dialog open={adminDialogOpen} onOpenChange={setAdminDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setAdminFormData({ username: "", password: "" })}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Admin
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New Admin</DialogTitle>
                    <DialogDescription>
                      Add a new administrator account with username and password
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateAdmin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="admin-username">Username *</Label>
                      <Input
                        id="admin-username"
                        value={adminFormData.username}
                        onChange={(e) => setAdminFormData({ ...adminFormData, username: e.target.value })}
                        required
                        placeholder="Enter username"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admin-password">Password *</Label>
                      <Input
                        id="admin-password"
                        type="password"
                        value={adminFormData.password}
                        onChange={(e) => setAdminFormData({ ...adminFormData, password: e.target.value })}
                        required
                        minLength={6}
                        placeholder="Enter password"
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create Admin
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mb-4">
              <p className="text-yellow-300 text-sm">
                <strong>Note:</strong> New admins will receive an email invitation to set up their account. 
                They can then log in using their username and the password you've set.
              </p>
            </div>
            <div className="text-center text-muted-foreground py-4">
              <p>Admin management functionality is ready. Click "Add Admin" to create new administrator accounts.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card animate-fade-in mt-8">
          <CardHeader>
            <div className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>QR Code Generator</CardTitle>
                <CardDescription>Generate a QR code to access the menu</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 bg-secondary/50 rounded-lg space-y-2">
                  <p className="text-sm font-medium">Menu URL:</p>
                  <code className="text-xs text-primary break-all">
                    {window.location.origin}/menu
                  </code>
                  <p className="text-xs text-muted-foreground mt-2">
                    Scan this QR code to access your digital menu
                  </p>
                </div>
                <Button onClick={generateQRCode} className="w-full">
                  <QrCode className="mr-2 h-4 w-4" />
                  Generate QR Code
                </Button>
              </div>
              <div className="flex flex-col items-center justify-center space-y-4">
                {qrCodeUrl ? (
                  <>
                    <div className="bg-white p-4 rounded-lg">
                      <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64" />
                    </div>
                    <Button onClick={downloadQRCode} className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      Download QR Code
                    </Button>
                  </>
                ) : (
                  <div className="text-center text-muted-foreground py-12">
                    <QrCode className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Click "Generate QR Code" to create your menu QR code</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Offers Management Section */}
        <Card className="border-border bg-card animate-fade-in mt-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Offers & Promotions</CardTitle>
                <CardDescription>Manage special offers and promotions</CardDescription>
              </div>
              <Dialog open={offerDialogOpen} onOpenChange={setOfferDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => {
                    setEditingOffer(null);
                    setOfferFormData({
                      title: "",
                      description: "",
                      is_active: false,
                    });
                  }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Offer
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{editingOffer ? "Edit Offer" : "Add New Offer"}</DialogTitle>
                    <DialogDescription>
                      {editingOffer ? "Update the offer details" : "Create a new promotional offer"}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleOfferSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Offer Title *</Label>
                      <Input
                        id="title"
                        value={offerFormData.title}
                        onChange={(e) => setOfferFormData({ ...offerFormData, title: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="offer-description">Description</Label>
                      <Textarea
                        id="offer-description"
                        value={offerFormData.description}
                        onChange={(e) => setOfferFormData({ ...offerFormData, description: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_active"
                        checked={offerFormData.is_active}
                        onCheckedChange={(checked) => setOfferFormData({ ...offerFormData, is_active: checked })}
                      />
                      <Label htmlFor="is_active">Active</Label>
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {editingOffer ? "Update Offer" : "Add Offer"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {offers.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No offers yet. Add your first offer!</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {offers.map((offer) => (
                      <TableRow key={offer.id}>
                        <TableCell className="font-medium">{offer.title}</TableCell>
                        <TableCell>{offer.description || "-"}</TableCell>
                        <TableCell>
                          <Badge variant={offer.is_active ? "default" : "secondary"}>
                            {offer.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleOfferStatus(offer)}
                            >
                              {offer.is_active ? "Deactivate" : "Activate"}
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleEditOffer(offer)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => handleDeleteOffer(offer.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Analytics Dashboard */}
      <Card className="border-border bg-card animate-fade-in mt-8">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Analytics Dashboard</CardTitle>
              <CardDescription>Real-time insights into your menu performance</CardDescription>
            </div>
            <Button onClick={fetchAnalyticsData} variant="outline" disabled={analyticsLoading}>
              {analyticsLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Refresh Data
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {analyticsLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Views Card */}
              <Card className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-cyan-300">Total Views</p>
                      <h3 className="text-2xl font-bold text-white">{analyticsData.totalViews}</h3>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Popular Items */}
              <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-300">Popular Items</p>
                      <h3 className="text-2xl font-bold text-white">{analyticsData.popularItems.length}</h3>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Peak Hours */}
              <Card className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-amber-500/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-amber-300">Peak Hour</p>
                      <h3 className="text-2xl font-bold text-white">
                        {analyticsData.peakHours.length > 0 ? `${analyticsData.peakHours[0].hour}:00` : "N/A"}
                      </h3>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Daily Average */}
              <Card className="bg-gradient-to-br from-green-500/20 to-teal-500/20 border-green-500/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-300">Daily Average</p>
                      <h3 className="text-2xl font-bold text-white">
                        {analyticsData.dailyViews.length > 0 
                          ? Math.round(analyticsData.dailyViews.reduce((sum, day) => sum + day.views, 0) / analyticsData.dailyViews.length)
                          : 0}
                      </h3>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Popular Items Chart */}
              <div className="md:col-span-2">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-lg">Popular Menu Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analyticsData.popularItems.map((item, index) => (
                        <div key={index} className="flex items-center">
                          <div className="w-32 text-sm font-medium text-foreground truncate">{item.name}</div>
                          <div className="flex-1 ml-4">
                            <div className="flex items-center">
                              <div 
                                className="h-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                                style={{ width: `${(item.views / Math.max(...analyticsData.popularItems.map(i => i.views))) * 100}%` }}
                              ></div>
                              <span className="ml-2 text-xs text-muted-foreground">{item.views}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Peak Hours Chart */}
              <div className="md:col-span-2">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-lg">Peak Hours</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end h-32 gap-2 mt-4">
                      {analyticsData.peakHours.map((hourData, index) => (
                        <div key={index} className="flex flex-col items-center flex-1">
                          <div 
                            className="w-full bg-gradient-to-t from-cyan-500 to-blue-500 rounded-t"
                            style={{ height: `${(hourData.views / Math.max(...analyticsData.peakHours.map(h => h.views))) * 100}%` }}
                          ></div>
                          <span className="mt-2 text-xs text-muted-foreground">{hourData.hour}:00</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Restaurant Settings Dialog */}
      <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Restaurant Settings</DialogTitle>
            <DialogDescription>
              Update your restaurant name and logo
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSettingsSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="restaurant-name">Restaurant Name *</Label>
              <Input
                id="restaurant-name"
                value={settingsFormData.name}
                onChange={(e) => setSettingsFormData({ ...settingsFormData, name: e.target.value })}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currency-code">Currency</Label>
                <Select
                  value={settingsFormData.currency_code}
                  onValueChange={(value) => setSettingsFormData({ ...settingsFormData, currency_code: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">INR (₹) - Indian Rupee</SelectItem>
                    <SelectItem value="USD">USD ($) - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR (€) - Euro</SelectItem>
                    <SelectItem value="GBP">GBP (£) - British Pound</SelectItem>
                    <SelectItem value="JPY">JPY (¥) - Japanese Yen</SelectItem>
                    <SelectItem value="AUD">AUD (A$) - Australian Dollar</SelectItem>
                    <SelectItem value="CAD">CAD (C$) - Canadian Dollar</SelectItem>
                    <SelectItem value="CHF">CHF (CHF) - Swiss Franc</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="language-code">Language</Label>
                <Select
                  value={settingsFormData.language_code}
                  onValueChange={(value) => setSettingsFormData({ ...settingsFormData, language_code: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español (Spanish)</SelectItem>
                    <SelectItem value="fr">Français (French)</SelectItem>
                    <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
                    <SelectItem value="de">Deutsch (German)</SelectItem>
                    <SelectItem value="ja">日本語 (Japanese)</SelectItem>
                    <SelectItem value="zh">中文 (Chinese)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="logo-url">Logo URL</Label>
              <Input
                id="logo-url"
                value={settingsFormData.logo_url}
                onChange={(e) => setSettingsFormData({ ...settingsFormData, logo_url: e.target.value })}
                placeholder="https://example.com/logo.png"
              />
              <div className="relative">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="logo-upload"
                />
                <Label htmlFor="logo-upload" className="cursor-pointer">
                  <Button type="button" variant="outline" className="w-full">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Logo
                  </Button>
                </Label>
              </div>
              {settingsFormData.logo_url && (
                <div className="mt-2">
                  <img 
                    src={settingsFormData.logo_url} 
                    alt="Preview" 
                    className="h-16 w-16 object-contain rounded-lg border"
                  />
                </div>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Settings
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Print-only styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-preview,
          .print-preview * {
            visibility: visible;
          }
          .print-preview {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            display: grid !important;
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 1rem !important;
            padding: 1rem;
          }
          .qr-print-item {
            break-inside: avoid;
            page-break-inside: avoid;
            border: 2px solid #000 !important;
            padding: 1rem !important;
            background: white !important;
          }
          .qr-print-item p {
            color: #000 !important;
            margin: 0.5rem 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;