import { Link, useLocation } from "react-router-dom";
import { Store, Home, GitCompare, Info, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface NavigationProps {
  user?: any;
}

export const Navigation = ({ user }: NavigationProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      navigate("/");
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Store className="h-5 w-5 text-white" />
            </div>
            <span className="font-semibold text-lg">Pricelens</span>
          </Link>

          <div className="flex items-center gap-1">
            <Button
              variant={isActive("/") ? "secondary" : "ghost"}
              size="sm"
              asChild
            >
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Link>
            </Button>
            <Button
              variant={isActive("/shops") ? "secondary" : "ghost"}
              size="sm"
              asChild
            >
              <Link to="/shops">
                <Store className="h-4 w-4 mr-2" />
                Shops
              </Link>
            </Button>
            <Button
              variant={isActive("/compare") ? "secondary" : "ghost"}
              size="sm"
              asChild
            >
              <Link to="/compare">
                <GitCompare className="h-4 w-4 mr-2" />
                Compare
              </Link>
            </Button>
            <Button
              variant={isActive("/about") ? "secondary" : "ghost"}
              size="sm"
              asChild
            >
              <Link to="/about">
                <Info className="h-4 w-4 mr-2" />
                About
              </Link>
            </Button>

            {user ? (
              <>
                <Button
                  variant={isActive("/dashboard") ? "secondary" : "ghost"}
                  size="sm"
                  asChild
                >
                  <Link to="/dashboard">
                    <User className="h-4 w-4 mr-2" />
                    Dashboard
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <Button variant="default" size="sm" asChild>
                <Link to="/auth">Login</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
