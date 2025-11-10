import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Store, Search, MapPin, TrendingDown } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

const Home = () => {
  const [user, setUser] = useState<User | null>(null);

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
      <Navigation user={user} />
      
      <main>
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Compare Real Local Prices
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Support Supela's Local Stores
            </p>
            <p className="text-lg text-foreground/80 mb-10 max-w-2xl mx-auto">
              Find the best deals on mobile phones and accessories from trusted local shops in Supela, Bhilai. 
              Compare prices, check locations, and support your community.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button size="lg" asChild className="shadow-lg">
                <Link to="/shops">
                  <Store className="mr-2 h-5 w-5" />
                  Browse Shops
                </Link>
              </Button>
              <Button size="lg" variant="secondary" asChild className="shadow-lg">
                <Link to="/compare">
                  <Search className="mr-2 h-5 w-5" />
                  Compare Prices
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="p-6 text-center border-primary/20 hover:border-primary/40 transition-colors">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <TrendingDown className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Real-Time Prices</h3>
              <p className="text-muted-foreground">
                Get up-to-date pricing information from local shopkeepers in Supela
              </p>
            </Card>

            <Card className="p-6 text-center border-secondary/20 hover:border-secondary/40 transition-colors">
              <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Find Nearby</h3>
              <p className="text-muted-foreground">
                Locate shops near you with integrated maps and distance information
              </p>
            </Card>

            <Card className="p-6 text-center border-accent/20 hover:border-accent/40 transition-colors">
              <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <Store className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Support Local</h3>
              <p className="text-muted-foreground">
                Help local businesses thrive by shopping at neighborhood stores
              </p>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-16">
          <Card className="max-w-3xl mx-auto p-12 text-center bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 border-primary/20">
            <h2 className="text-3xl font-bold mb-4">
              Are you a shopkeeper in Supela?
            </h2>
            <p className="text-muted-foreground mb-6">
              Join Pricelens today and reach more customers in your area. 
              Manage your inventory and prices with our easy-to-use dashboard.
            </p>
            <Button size="lg" asChild>
              <Link to="/auth">Get Started</Link>
            </Button>
          </Card>
        </section>
      </main>

      <footer className="border-t mt-20 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© Pricelens 2025 | Made in Bhilai</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
