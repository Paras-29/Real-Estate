import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, X, UserRound } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLeads } from "@/contexts/LeadsContext";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const { hasReminders } = useLeads();
  const location = useLocation();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Properties", path: "/properties" },
    { name: "Commissions", path: "/commissions" },
    { name: "Leads", path: "/leads" },
    { name: "Global Agents", path: "/global-agents" },


  ];

  const closeMobileMenu = () => {
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
        <div className="w-56 h-28">
            <Link to="/">
              <img src="/kamaupoot logo.webp" className="w-full h-full " alt="Kamaaupoot Logo" />
            </Link>
          </div>
        </div>
        

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`text-sm font-medium transition-colors relative ${
                location.pathname === link.path 
                  ? 'text-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {link.name}
              {link.name === "Leads" && hasReminders && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <Link to="/profile" className="text-sm font-medium transition-colors hover:text-foreground flex items-center gap-1">
                <UserRound size={18} />
                <span>Profile</span>
              </Link>
              <Button onClick={logout} size="sm" variant="outline">
                Log out
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline" size="sm">
                  Log in
                </Button>
              </Link>
              <Link to="/register">
                <Button
                  size="sm"
                  className="bg-estate-green hover:bg-estate-green/90"
                >
                  Register
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Navigation */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" aria-label="Menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <div className="flex flex-col gap-6 mt-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-lg font-medium transition-colors hover:text-primary relative ${
                    location.pathname === link.path ? 'text-primary' : ''
                  }`}
                  onClick={closeMobileMenu}
                >
                  {link.name}
                  {link.name === "Leads" && hasReminders && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                  )}
                </Link>
              ))}
              {user && (
                <Link to="/profile" className="text-lg font-medium transition-colors hover:text-primary flex items-center gap-2" onClick={closeMobileMenu}>
                  <UserRound size={20} />
                  <span>Profile</span>
                </Link>
              )}
              <div className="flex flex-col gap-2 mt-4 bg-red-400">
                {user ? (
                  <Button onClick={() => { logout(); closeMobileMenu(); }} className="w-full">
                    Log out
                  </Button>
                ) : (
                  <>
                    <Link to="/login" onClick={closeMobileMenu}>
                      <Button variant="outline" className="w-full">
                        Log in
                      </Button>
                    </Link>
                    <Link to="/register" onClick={closeMobileMenu}>
                      <Button className="w-full bg-estate-green hover:bg-estate-blue/90">
                        Register
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
