import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { Loader2, LogOut, Plus, Pencil, Trash2, QrCode, Download, Printer } from "lucide-react";
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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [offerDialogOpen, setOfferDialogOpen] = useState(false);
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
  const [tableNumber, setTableNumber] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [bulkTables, setBulkTables] = useState("");
  const [bulkQrCodes, setBulkQrCodes] = useState<Array<{ table: string; url: string }>>([]);

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
      Promise.all([fetchMenuItems(), fetchOffers()]);
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
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

  const generateQRCode = async () => {
    if (!tableNumber.trim()) {
      toast.error("Please enter a table number");
      return;
    }

    try {
      const menuUrl = `${window.location.origin}/menu`;
      const qrDataUrl = await QRCode.toDataURL(menuUrl, {
        width: 512,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
      setQrCodeUrl(qrDataUrl);
      toast.success("QR code generated!");
    } catch (error) {
      toast.error("Failed to generate QR code");
      console.error(error);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement("a");
    link.href = qrCodeUrl;
    link.download = `table-${tableNumber}-qr-code.png`;
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

        <Card className="border-border bg-card animate-fade-in mt-8">
          <CardHeader>
            <div className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>QR Code Generator</CardTitle>
                <CardDescription>Generate QR codes for tables to access the menu</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tableNumber">Table Number or Name</Label>
                  <div className="flex gap-2">
                    <Input
                      id="tableNumber"
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      placeholder="e.g., Table 1, Bar, Patio"
                    />
                    <Button onClick={generateQRCode}>
                      <QrCode className="mr-2 h-4 w-4" />
                      Generate
                    </Button>
                  </div>
                </div>
                <div className="p-4 bg-secondary/50 rounded-lg space-y-2">
                  <p className="text-sm font-medium">Menu URL:</p>
                  <code className="text-xs text-primary break-all">
                    {window.location.origin}/menu
                  </code>
                  <p className="text-xs text-muted-foreground mt-2">
                    All QR codes will point to this URL
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center space-y-4">
                {qrCodeUrl ? (
                  <>
                    <div className="bg-white p-4 rounded-lg">
                      <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64" />
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-sm font-medium">
                        QR Code for: <span className="text-primary">{tableNumber}</span>
                      </p>
                      <Button onClick={downloadQRCode} className="w-full">
                        <Download className="mr-2 h-4 w-4" />
                        Download QR Code
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-muted-foreground py-12">
                    <QrCode className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Enter a table number and click Generate</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card animate-fade-in mt-8">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Printer className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Bulk QR Code Generator</CardTitle>
                <CardDescription>Generate and print multiple QR codes at once</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bulkTables">Table Numbers (comma or line separated)</Label>
                <textarea
                  id="bulkTables"
                  className="w-full min-h-[120px] px-3 py-2 rounded-md border border-input bg-background text-foreground"
                  value={bulkTables}
                  onChange={(e) => setBulkTables(e.target.value)}
                  placeholder="Table 1, Table 2, Table 3&#10;or&#10;Table 1&#10;Table 2&#10;Table 3"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={generateBulkQRCodes} className="flex-1">
                  <QrCode className="mr-2 h-4 w-4" />
                  Generate All QR Codes
                </Button>
                <Button 
                  onClick={printQRCodes} 
                  variant="outline"
                  disabled={bulkQrCodes.length === 0}
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Print All ({bulkQrCodes.length})
                </Button>
              </div>
              
              {bulkQrCodes.length > 0 && (
                <div className="print-preview mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {bulkQrCodes.map((qr, index) => (
                    <div key={index} className="qr-print-item border border-border rounded-lg p-4 text-center space-y-2">
                      <div className="bg-white p-2 rounded">
                        <img src={qr.url} alt={`QR Code for ${qr.table}`} className="w-full h-auto" />
                      </div>
                      <p className="font-semibold text-foreground">{qr.table}</p>
                      <p className="text-xs text-muted-foreground">Scan for Menu</p>
                    </div>
                  ))}
                </div>
              )}
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