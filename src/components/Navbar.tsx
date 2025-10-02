import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Truck, User, Menu, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, userProfile, signOut } = useAuth();
  const isLoggedIn = !!user;
  const isAdmin = userProfile?.user_type === 'admin';

  const handleLogout = async () => {
    await signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const navigationLinks = [
    { label: "Home", path: "/" },
    { label: "Same-Day Delivery", path: "/same-day-delivery" },
    { label: "Track Order", path: "/track" },
    { label: "Book Truck", path: "/trucks" },
    { label: "Become a Partner", path: "/partner" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full glass border-b border-border/50">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 group">
          <div className="rounded-lg bg-gradient-hero p-2 transition-all duration-500 group-hover:scale-110 group-hover:shadow-glow">
            <Truck className="h-6 w-6 text-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">Load<span className="text-secondary">Wheels</span></span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:space-x-6">
          {navigationLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="text-sm font-medium text-foreground transition-all duration-500 hover:text-secondary relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-secondary after:transition-all after:duration-500 hover:after:w-full"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex md:items-center md:space-x-4">
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-popover">
                <div className="px-2 py-2 border-b border-border">
                  <p className="text-sm font-medium">{user?.user_metadata?.name || userProfile?.name || 'User'}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                  {isAdmin && <p className="text-xs text-secondary font-medium">Admin</p>}
                </div>
                {isAdmin ? (
                  <DropdownMenuItem onClick={() => navigate("/admin/dashboard")}>
                    <Truck className="mr-2 h-4 w-4" />
                    Admin Dashboard
                  </DropdownMenuItem>
                ) : (
                  <>
                    <DropdownMenuItem onClick={() => navigate("/profile")}>
                      <User className="mr-2 h-4 w-4" />
                      My Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/bookings")}>
                      <Truck className="mr-2 h-4 w-4" />
                      My Bookings
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" className="hover:text-secondary transition-all duration-500" onClick={() => navigate("/login")}>
                Login
              </Button>
              <Button
                className="bg-secondary hover:bg-secondary-hover text-secondary-foreground shadow-lg transition-all duration-500 hover:scale-105 hover:shadow-glow"
                onClick={() => navigate("/register")}
              >
                Sign Up
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] bg-background">
            <div className="flex flex-col space-y-4 mt-8">
              {navigationLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-base font-medium text-foreground transition-colors hover:text-primary py-2"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-border space-y-2">
                {isLoggedIn ? (
                  <>
                    <div className="px-2 py-2 border-b border-border">
                      <p className="text-sm font-medium">{user?.user_metadata?.name || userProfile?.name || 'User'}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                      {isAdmin && <p className="text-xs text-secondary font-medium">Admin</p>}
                    </div>
                    {isAdmin ? (
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => navigate("/admin/dashboard")}
                      >
                        <Truck className="mr-2 h-4 w-4" />
                        Admin Dashboard
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => navigate("/profile")}
                        >
                          <User className="mr-2 h-4 w-4" />
                          My Profile
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => navigate("/bookings")}
                        >
                          <Truck className="mr-2 h-4 w-4" />
                          My Bookings
                        </Button>
                      </>
                    )}
                    <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      className="w-full"
                      onClick={() => navigate("/login")}
                    >
                      Login
                    </Button>
                    <Button
                      className="w-full bg-gradient-hero hover:opacity-90"
                      onClick={() => navigate("/register")}
                    >
                      Sign Up
                    </Button>
                  </>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};

export default Navbar;
