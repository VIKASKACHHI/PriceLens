import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Store as StoreIcon } from "lucide-react";
import { User } from "@supabase/supabase-js";

interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  role: string;
}

interface Shop {
  id: string;
  name: string;
  address: string;
  contact: string;
  category: string;
  rating: number;
  latitude: number | null;
  longitude: number | null;
}

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string | null;
  image_url: string | null;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Shop form state
  const [shopForm, setShopForm] = useState({
    name: "",
    address: "",
    contact: "",
    category: "",
    latitude: "",
    longitude: "",
  });

  // Product form state
  const [productForm, setProductForm] = useState({
    id: "",
    name: "",
    category: "",
    price: "",
    description: "",
    image_url: "",
  });

  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [isShopDialogOpen, setIsShopDialogOpen] = useState(false);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);
      await fetchProfile(session.user.id);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          navigate("/auth");
        } else {
          setUser(session.user);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
    } else {
      setProfile(data);
      if (data.role === "shopkeeper") {
        await fetchShop(userId);
      } else {
        toast({
          title: "Access Denied",
          description: "Only shopkeepers can access the dashboard.",
          variant: "destructive",
        });
        navigate("/");
      }
    }
    setLoading(false);
  };

  const fetchShop = async (userId: string) => {
    const { data, error } = await supabase
      .from("shops")
      .select("*")
      .eq("owner_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching shop:", error);
    } else if (data) {
      setShop(data);
      setShopForm({
        name: data.name,
        address: data.address,
        contact: data.contact,
        category: data.category,
        latitude: data.latitude?.toString() || "",
        longitude: data.longitude?.toString() || "",
      });
      await fetchProducts(data.id);
    }
  };

  const fetchProducts = async (shopId: string) => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("shop_id", shopId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching products:", error);
    } else {
      setProducts(data || []);
    }
  };

  const handleShopSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const shopData = {
      owner_id: user?.id,
      name: shopForm.name,
      address: shopForm.address,
      contact: shopForm.contact,
      category: shopForm.category,
      latitude: shopForm.latitude ? parseFloat(shopForm.latitude) : null,
      longitude: shopForm.longitude ? parseFloat(shopForm.longitude) : null,
    };

    if (shop) {
      const { error } = await supabase
        .from("shops")
        .update(shopData)
        .eq("id", shop.id);

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({ title: "Shop updated successfully!" });
        await fetchShop(user!.id);
        setIsShopDialogOpen(false);
      }
    } else {
      const { data, error } = await supabase
        .from("shops")
        .insert([shopData])
        .select()
        .single();

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({ title: "Shop created successfully!" });
        setShop(data);
        await fetchShop(user!.id);
        setIsShopDialogOpen(false);
      }
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!shop) {
      toast({
        title: "Error",
        description: "Please create a shop first.",
        variant: "destructive",
      });
      return;
    }

    const productData = {
      shop_id: shop.id,
      name: productForm.name,
      category: productForm.category,
      price: parseFloat(productForm.price),
      description: productForm.description || null,
      image_url: productForm.image_url || null,
    };

    if (isEditingProduct && productForm.id) {
      const { error } = await supabase
        .from("products")
        .update(productData)
        .eq("id", productForm.id);

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({ title: "Product updated successfully!" });
        await fetchProducts(shop.id);
        resetProductForm();
      }
    } else {
      const { error } = await supabase
        .from("products")
        .insert([productData]);

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({ title: "Product added successfully!" });
        await fetchProducts(shop.id);
        resetProductForm();
      }
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Product deleted successfully!" });
      await fetchProducts(shop!.id);
    }
  };

  const editProduct = (product: Product) => {
    setProductForm({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      description: product.description || "",
      image_url: product.image_url || "",
    });
    setIsEditingProduct(true);
    setIsProductDialogOpen(true);
  };

  const resetProductForm = () => {
    setProductForm({
      id: "",
      name: "",
      category: "",
      price: "",
      description: "",
      image_url: "",
    });
    setIsEditingProduct(false);
    setIsProductDialogOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation user={user} />
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={user} />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold">Shopkeeper Dashboard</h1>
            <p className="text-muted-foreground">Welcome, {profile?.full_name}</p>
          </div>
        </div>

        <Tabs defaultValue="shop" className="space-y-6">
          <TabsList>
            <TabsTrigger value="shop">My Shop</TabsTrigger>
            <TabsTrigger value="products">My Products</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="shop">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">Shop Information</h2>
                <Dialog open={isShopDialogOpen} onOpenChange={setIsShopDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      {shop ? <Edit className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                      {shop ? "Edit Shop" : "Create Shop"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{shop ? "Edit Shop" : "Create Shop"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleShopSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="shop-name">Shop Name *</Label>
                        <Input
                          id="shop-name"
                          value={shopForm.name}
                          onChange={(e) => setShopForm({ ...shopForm, name: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="shop-address">Address *</Label>
                        <Textarea
                          id="shop-address"
                          value={shopForm.address}
                          onChange={(e) => setShopForm({ ...shopForm, address: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="shop-contact">Contact Number *</Label>
                        <Input
                          id="shop-contact"
                          type="tel"
                          value={shopForm.contact}
                          onChange={(e) => setShopForm({ ...shopForm, contact: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="shop-category">Category *</Label>
                        <Input
                          id="shop-category"
                          value={shopForm.category}
                          onChange={(e) => setShopForm({ ...shopForm, category: e.target.value })}
                          placeholder="e.g., Mobile Phones, Accessories"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="shop-latitude">Latitude (optional)</Label>
                          <Input
                            id="shop-latitude"
                            type="number"
                            step="any"
                            value={shopForm.latitude}
                            onChange={(e) => setShopForm({ ...shopForm, latitude: e.target.value })}
                            placeholder="21.1938"
                          />
                        </div>
                        <div>
                          <Label htmlFor="shop-longitude">Longitude (optional)</Label>
                          <Input
                            id="shop-longitude"
                            type="number"
                            step="any"
                            value={shopForm.longitude}
                            onChange={(e) => setShopForm({ ...shopForm, longitude: e.target.value })}
                            placeholder="81.3509"
                          />
                        </div>
                      </div>
                      <Button type="submit" className="w-full">
                        {shop ? "Update Shop" : "Create Shop"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {shop ? (
                <div className="space-y-4">
                  <div>
                    <Label>Shop Name</Label>
                    <p className="text-lg font-medium">{shop.name}</p>
                  </div>
                  <div>
                    <Label>Address</Label>
                    <p className="text-muted-foreground">{shop.address}</p>
                  </div>
                  <div>
                    <Label>Contact</Label>
                    <p className="text-muted-foreground">{shop.contact}</p>
                  </div>
                  <div>
                    <Label>Category</Label>
                    <p className="text-muted-foreground">{shop.category}</p>
                  </div>
                  <div>
                    <Label>Rating</Label>
                    <p className="text-muted-foreground">{shop.rating.toFixed(1)} / 5.0</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <StoreIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">You haven't created a shop yet.</p>
                  <Button onClick={() => setIsShopDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your Shop
                  </Button>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">Products</h2>
                <Dialog open={isProductDialogOpen} onOpenChange={(open) => {
                  setIsProductDialogOpen(open);
                  if (!open) resetProductForm();
                }}>
                  <DialogTrigger asChild>
                    <Button disabled={!shop}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{isEditingProduct ? "Edit Product" : "Add Product"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleProductSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="product-name">Product Name *</Label>
                        <Input
                          id="product-name"
                          value={productForm.name}
                          onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="product-category">Category *</Label>
                        <Input
                          id="product-category"
                          value={productForm.category}
                          onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                          placeholder="e.g., Smartphone, Case, Charger"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="product-price">Price (₹) *</Label>
                        <Input
                          id="product-price"
                          type="number"
                          step="0.01"
                          value={productForm.price}
                          onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="product-description">Description</Label>
                        <Textarea
                          id="product-description"
                          value={productForm.description}
                          onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="product-image">Image URL</Label>
                        <Input
                          id="product-image"
                          type="url"
                          value={productForm.image_url}
                          onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                      <Button type="submit" className="w-full">
                        {isEditingProduct ? "Update Product" : "Add Product"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {!shop ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Please create a shop first to add products.</p>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No products added yet.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>₹{product.price.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => editProduct(product)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteProduct(product.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-6">Profile Information</h2>
              <div className="space-y-4">
                <div>
                  <Label>Full Name</Label>
                  <p className="text-lg font-medium">{profile?.full_name}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="text-muted-foreground">{user?.email}</p>
                </div>
                <div>
                  <Label>Phone</Label>
                  <p className="text-muted-foreground">{profile?.phone || "Not provided"}</p>
                </div>
                <div>
                  <Label>Role</Label>
                  <p className="text-muted-foreground capitalize">{profile?.role}</p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t mt-20 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© Pricelens 2025 | Made in Bhilai</p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
