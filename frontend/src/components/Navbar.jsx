import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Heart, LayoutDashboard, LogOut, GraduationCap } from "lucide-react";
import CitySwitcher from "@/components/CitySwitcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogin = () => {
    const redirectUrl = window.location.origin + "/dashboard";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <nav className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 border-b border-gray-200/60" data-testid="main-navbar">
      <div className="max-w-7xl mx-auto px-6 md:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2" data-testid="logo-link">
          <div className="w-9 h-9 rounded-xl bg-[#E07A5F] flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <div className="leading-tight">
            <div className="font-bold text-gray-900 text-lg" style={{ fontFamily: "Outfit, sans-serif" }}>
              Admitly
            </div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500 -mt-0.5">School Admissions</div>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link to="/schools" className="text-sm font-medium text-gray-700 hover:text-[#E07A5F] transition-colors duration-200" data-testid="nav-schools">
            Browse Schools
          </Link>
          {user && (
            <>
              <Link to="/dashboard" className="text-sm font-medium text-gray-700 hover:text-[#E07A5F] transition-colors duration-200" data-testid="nav-dashboard">
                Dashboard
              </Link>
              <Link to="/favourites" className="text-sm font-medium text-gray-700 hover:text-[#E07A5F] transition-colors duration-200" data-testid="nav-favourites">
                Favourites
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          <CitySwitcher compact />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full hover:ring-2 hover:ring-[#E07A5F]/30 transition" data-testid="user-menu-trigger">
                  {user.picture ? (
                    <img src={user.picture} alt={user.name} className="w-9 h-9 rounded-full object-cover" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-[#E07A5F] text-white flex items-center justify-center font-semibold">
                      {user.name?.[0]?.toUpperCase()}
                    </div>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <div className="text-sm font-semibold">{user.name}</div>
                  <div className="text-xs text-gray-500 truncate">{user.email}</div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/dashboard")} data-testid="menu-dashboard">
                  <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/favourites")} data-testid="menu-favourites">
                  <Heart className="w-4 h-4 mr-2" /> Favourites
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={async () => { await logout(); navigate("/"); }} data-testid="menu-logout">
                  <LogOut className="w-4 h-4 mr-2" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              onClick={handleLogin}
              className="rounded-full bg-[#1F2937] hover:bg-[#E07A5F] text-white px-5 transition-colors duration-200"
              data-testid="login-button"
            >
              Sign in with Google
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
