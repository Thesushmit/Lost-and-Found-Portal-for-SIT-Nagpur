import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Plus, List, LogOut, User } from "lucide-react";

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Search className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg hidden sm:block">Lost & Found</span>
          </Link>

          {/* Navigation Links */}
          {user && (
            <div className="flex items-center gap-1">
              <Link to="/dashboard">
                <Button
                  variant={isActive("/dashboard") ? "secondary" : "ghost"}
                  size="sm"
                  className="gap-2"
                >
                  <List className="w-4 h-4" />
                  <span className="hidden sm:inline">Browse Items</span>
                </Button>
              </Link>
              <Link to="/report">
                <Button
                  variant={isActive("/report") ? "secondary" : "ghost"}
                  size="sm"
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Report Found</span>
                </Button>
              </Link>
            </div>
          )}

          {/* User Menu */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {profile?.full_name?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{profile?.full_name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{profile?.email}</p>
                    <p className="text-xs leading-none text-accent capitalize mt-1">
                      {profile?.role}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/my-reports")}>
                  <User className="mr-2 h-4 w-4" />
                  My Reports
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth">
              <Button>Sign In</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
