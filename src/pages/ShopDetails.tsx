import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Star, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

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

const ShopDetails = () => {
  const { id } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  // Read Google Maps API key from Vite env var. Set this in your deployment (Vercel) as VITE_GOOGLE_MAPS_API_KEY.
  const googleMapsKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (id) {
      fetchShopDetails();
      fetchProducts();
    }
  }, [id]);

  const fetchShopDetails = async () => {
    const { data, error } = await supabase
      .from("shops")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching shop:", error);
    } else {
      setShop(data);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("shop_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching products:", error);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  if (!shop) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation user={user} />
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-muted-foreground">Loading shop details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={user} />

      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/shops">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Shops
          </Link>
        </Button>

        <Card className="p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{shop.name}</h1>
              <span className="bg-secondary/20 text-secondary px-3 py-1 rounded-full text-sm">
                {shop.category}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="text-xl font-semibold">{shop.rating.toFixed(1)}</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium mb-1">Address</p>
                  <p className="text-muted-foreground">{shop.address}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium mb-1">Contact</p>
                  <p className="text-muted-foreground">{shop.contact}</p>
                </div>
              </div>
            </div>

            {shop.latitude && shop.longitude && (
              <div>
                <p className="font-medium mb-2">Location</p>
                {googleMapsKey ? (
                  <iframe
                    width="100%"
                    height="200"
                    frameBorder="0"
                    style={{ border: 0, borderRadius: "0.5rem" }}
                    src={`https://www.google.com/maps/embed/v1/place?key=${googleMapsKey}&q=${shop.latitude},${shop.longitude}&zoom=15`}
                    allowFullScreen
                  />
                ) : (
                  <div className="p-4 rounded bg-muted text-sm text-muted-foreground">
                    Google Maps API key is not configured. Set VITE_GOOGLE_MAPS_API_KEY in your environment to enable the embedded map.
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        <h2 className="text-2xl font-bold mb-6">Available Products</h2>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No products listed yet.</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="p-4 hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-muted rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-muted-foreground text-sm">No image</span>
                  )}
                </div>
                <h3 className="font-semibold mb-1">{product.name}</h3>
                <p className="text-xs text-muted-foreground mb-2">{product.category}</p>
                <p className="text-2xl font-bold text-primary">₹{product.price.toFixed(2)}</p>
                {product.description && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {product.description}
                  </p>
                )}
              </Card>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t mt-20 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© Pricelens 2025 | Made in Bhilai</p>
        </div>
      </footer>
    </div>
  );
};

export default ShopDetails;
