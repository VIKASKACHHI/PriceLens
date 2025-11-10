import { useState, useEffect, useRef } from "react";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Phone, ExternalLink, Navigation as NavigationIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import { calculateDistance } from "@/lib/utils";
import { toast } from "sonner";
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
// ensure marker icons load correctly with Vite by importing the images
import markerIconUrl from 'leaflet/dist/images/marker-icon.png';
import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Workaround: some TS setups in this repo have strict prop typings for react-leaflet.
// Create any-typed aliases to avoid JSX typing errors in this file.
const AnyMapContainer: any = MapContainer as any;
const AnyTileLayer: any = TileLayer as any;
const AnyMarker: any = Marker as any;
const AnyTooltip: any = Tooltip as any;

interface Shop {
  id: string;
  name: string;
  address: string;
  contact: string;
  category: string;
  discount?: number | null;
  rating: number;
  latitude: number | null;
  longitude: number | null;
  distance?: number;
}

const Shops = () => {
  const [user, setUser] = useState<User | null>(null);
  const [shops, setShops] = useState<Shop[]>([]);
  const [filteredShops, setFilteredShops] = useState<Shop[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [sortByDistance, setSortByDistance] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const mapRef = useRef<any>(null);

  // fit map bounds to markers when map is shown or filteredShops change
  useEffect(() => {
    if (!showMap || !mapRef.current) return;
    const coords = filteredShops
      .filter(s => s.latitude && s.longitude)
      .map(s => [Number(s.latitude), Number(s.longitude)]) as [number, number][];

    if (coords.length === 0) return;

    const map = mapRef.current;
    try {
      if (coords.length === 1) {
        map.setView(coords[0], 14);
      } else {
        const bounds = L.latLngBounds(coords as any);
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    } catch (e) {
      // swallow map errors in edge cases
      console.warn('Could not fit map bounds', e);
    }
  }, [showMap, filteredShops]);

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
    fetchShops();
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
          toast.success("Location detected");
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.error("Could not get your location");
        }
      );
    }
  };

  useEffect(() => {
    filterShops();
  }, [shops, searchTerm, categoryFilter, userLocation, sortByDistance]);

  // set default Leaflet icon to avoid missing-marker issues in some bundlers
  useEffect(() => {
    const defaultIcon = L.icon({
      iconUrl: markerIconUrl as string,
      shadowUrl: markerShadowUrl as string,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
    });
    // @ts-ignore
    L.Marker.prototype.options.icon = defaultIcon;
  }, []);

  const fetchShops = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("shops")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching shops:", error);
    } else {
      setShops(data || []);
    }
    setLoading(false);
  };

  const filterShops = () => {
    let filtered = shops.map(shop => {
      if (userLocation && shop.latitude && shop.longitude) {
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lon,
          Number(shop.latitude),
          Number(shop.longitude)
        );
        return { ...shop, distance };
      }
      return shop;
    });

    if (searchTerm) {
      filtered = filtered.filter(shop =>
        shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shop.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(shop => shop.category === categoryFilter);
    }

    if (sortByDistance && userLocation) {
      filtered = filtered.sort((a, b) => {
        if (a.distance === undefined) return 1;
        if (b.distance === undefined) return -1;
        return a.distance - b.distance;
      });
    }

    setFilteredShops(filtered);
  };

  const categories = Array.from(new Set(shops.map(shop => shop.category)));

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={user} />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Local Shops in Supela</h1>

        {/* Filters */}
        <Card className="p-6 mb-8">
          <div className="grid md:grid-cols-4 gap-4">
            <Input
              placeholder="Search by name or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant={sortByDistance ? "default" : "secondary"}
              onClick={() => setSortByDistance(!sortByDistance)}
              disabled={!userLocation}
            >
              <NavigationIcon className="h-4 w-4 mr-2" />
              Sort by Distance
            </Button>
            <Button
              variant={showMap ? "default" : "secondary"}
              onClick={() => setShowMap(!showMap)}
            >
              Show All Shops on Map
            </Button>
            <Button variant="secondary" onClick={() => {
              setSearchTerm("");
              setCategoryFilter("all");
              setSortByDistance(false);
            }}>
              Clear Filters
            </Button>
          </div>
        </Card>

        {/* Map (toggle) */}
        {showMap && (
          <Card className="p-0 mb-8">
            <div className="w-full h-96">
              <AnyMapContainer
                center={
                  userLocation ? [userLocation.lat, userLocation.lon] : [21.2, 81.3]
                }
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                whenCreated={(mapInstance) => { mapRef.current = mapInstance; }}
              >
                <AnyTileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {filteredShops.filter(s => s.latitude && s.longitude).map(shop => (
                  <AnyMarker
                    key={shop.id}
                    position={[Number(shop.latitude), Number(shop.longitude)]}
                  >
                      <AnyTooltip direction="top" offset={[0, -10]} opacity={0.95}>
                        <div className="text-sm">
                          <div className="font-semibold">{shop.name}</div>
                          <div className="text-xs text-muted-foreground">{shop.category}</div>
                          {shop.discount !== undefined && shop.discount !== null && (
                            <div className="text-xs">Discount: <strong>{shop.discount}%</strong></div>
                          )}
                          <div className="text-xs text-muted-foreground mt-1">{shop.address}</div>
                        </div>
                      </AnyTooltip>
                  </AnyMarker>
                ))}
              </AnyMapContainer>
            </div>
          </Card>
        )}

        {/* Shops Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading shops...</p>
          </div>
        ) : filteredShops.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No shops found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredShops.map((shop) => (
              <Card key={shop.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{shop.name}</h3>
                    <span className="text-xs bg-secondary/20 text-secondary px-2 py-1 rounded">
                      {shop.category}
                    </span>
                  </div>
                  {/* rating removed per requirements */}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{shop.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4 flex-shrink-0" />
                    <span>{shop.contact}</span>
                  </div>
                  {shop.distance !== undefined && (
                    <div className="flex items-center gap-2 text-sm font-medium text-primary">
                      <NavigationIcon className="h-4 w-4 flex-shrink-0" />
                      <span>{shop.distance} km away</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button asChild className="flex-1">
                    <Link to={`/shop/${shop.id}`}>View Details</Link>
                  </Button>
                  {shop.latitude && shop.longitude && (
                    <Button
                      variant="secondary"
                      size="icon"
                      asChild
                    >
                      <a
                        href={`https://www.google.com/maps?q=${shop.latitude},${shop.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
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

export default Shops;
