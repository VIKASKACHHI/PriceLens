import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Target, Users, Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

const About = () => {
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
    <div className="min-h-screen bg-background">
      <Navigation user={user} />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-6 text-center">About Pricelens</h1>
          
          <Card className="p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Pricelens is dedicated to bridging the gap between local shopkeepers and customers in Supela, Bhilai. 
              We believe in empowering the local economy by providing a transparent platform where customers can compare 
              real prices from neighborhood stores, and shopkeepers can showcase their products to a wider audience.
            </p>
          </Card>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="p-6 text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Transparency</h3>
              <p className="text-muted-foreground">
                Real-time price comparison helps customers make informed decisions
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Community</h3>
              <p className="text-muted-foreground">
                Supporting local businesses strengthens our neighborhood
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <Heart className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Trust</h3>
              <p className="text-muted-foreground">
                Building relationships between shopkeepers and customers
              </p>
            </Card>
          </div>

          <Card className="p-8">
            <h2 className="text-2xl font-semibold mb-4">Why Pricelens?</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                In today's digital age, large e-commerce platforms dominate the market, often leaving local 
                businesses struggling to compete. Pricelens was created to level the playing field by giving 
                local shopkeepers in Supela a digital presence without the complexity of managing their own 
                online stores.
              </p>
              <p>
                For customers, we provide a convenient way to discover the best local deals without having to 
                physically visit multiple shops. You can compare prices, check product availability, and even 
                locate shops on the map—all from the comfort of your home.
              </p>
              <p>
                For shopkeepers, we offer a simple dashboard to manage products and prices, reaching more 
                customers in the local area and building lasting relationships with the community.
              </p>
              <p className="font-medium text-foreground">
                Together, we're building a stronger, more connected Supela.
              </p>
            </div>
          </Card>
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

export default About;
