import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, TrendingDown, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { User } from "@supabase/supabase-js";

interface ProductWithShop {
  id: string;
  name: string;
  category: string;
  price: number;
  shop_id: string;
  shop_name: string;
  shop_address: string;
  shop_latitude: number | null;
  shop_longitude: number | null;
}

const Compare = () => {
  const [user, setUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<ProductWithShop[]>([]);
  const [loading, setLoading] = useState(false);

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

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    const { data: products, error } = await supabase
      .from("products")
      .select(`
        id,
        name,
        category,
        price,
        shop_id,
        shops:shop_id (
          name,
          address,
          latitude,
          longitude
        )
      `)
      .ilike("name", `%${searchTerm}%`)
      .order("price", { ascending: true });

    if (error) {
      console.error("Error searching products:", error);
    } else {
      const formatted = products?.map((p: any) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        price: p.price,
        shop_id: p.shop_id,
        shop_name: p.shops.name,
        shop_address: p.shops.address,
        shop_latitude: p.shops.latitude,
        shop_longitude: p.shops.longitude,
      })) || [];
      setSearchResults(formatted);
    }
    setLoading(false);
  };

  const lowestPrice = searchResults.length > 0 
    ? Math.min(...searchResults.map(p => p.price)) 
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={user} />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Compare Prices</h1>
          <p className="text-muted-foreground mb-8">
            Search for a product and compare prices across local shops in Supela
          </p>

          {/* Search Bar */}
          <Card className="p-6 mb-8">
            <div className="flex gap-4">
              <Input
                placeholder="Search for a product (e.g., iPhone 15, Samsung Galaxy)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={loading}>
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
            </div>
          </Card>

          {/* Results */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Searching...</p>
            </div>
          ) : searchResults.length === 0 && searchTerm ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No products found. Try a different search term.</p>
            </Card>
          ) : searchResults.length > 0 ? (
            <Card className="overflow-hidden">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold mb-2">
                  Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchTerm}"
                </h2>
                <p className="text-sm text-muted-foreground">
                  Sorted by price (lowest to highest)
                </p>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Shop Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {searchResults.map((product, index) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.category}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{product.shop_name}</p>
                          <p className="text-xs text-muted-foreground">{product.shop_address}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold">₹{product.price.toFixed(2)}</span>
                          {product.price === lowestPrice && (
                            <Badge className="bg-green-500">
                              <TrendingDown className="h-3 w-3 mr-1" />
                              Best Deal
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button variant="secondary" size="sm" asChild>
                            <Link to={`/shop/${product.shop_id}`}>View Shop</Link>
                          </Button>
                          {product.shop_latitude && product.shop_longitude && (
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                            >
                              <a
                                href={`https://www.google.com/maps?q=${product.shop_latitude},${product.shop_longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          ) : null}
        </div>
      </main>

      <footer className="border-t mt-20 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© Pricelens 2025 | Made in Bhilai</p>
        </div>
      </footer>
    </div>
  );
};

export default Compare;
