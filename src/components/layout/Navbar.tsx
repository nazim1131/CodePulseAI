import { Github, Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Dashboard", path: "/dashboard" },
  { label: "Pricing", path: "/pricing" },
  { label: "Settings", path: "/settings" },
];

export const Navbar = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">AI</span>
          </div>
          <span className="text-lg font-bold text-foreground">CodeReview</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(l => (
            <Link
              key={l.path}
              to={l.path}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                location.pathname === l.path
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-foreground">{user.name}</span>
              {user.avatar ? (
                <img src={user.avatar} alt="avatar" className="h-8 w-8 rounded-full border border-border" />
              ) : (
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">{user.name?.charAt(0) || 'U'}</div>
              )}
            </div>
          ) : (
            <Link to="/login" className="flex items-center gap-2 rounded-full border border-primary bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
              <Github className="h-4 w-4" />
              Login with GitHub
            </Link>
          )}
        </div>

        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background p-4 space-y-2">
          {navLinks.map(l => (
            <Link key={l.path} to={l.path} onClick={() => setOpen(false)} className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground">{l.label}</Link>
          ))}
          {user ? (
            <div className="px-4 py-2 text-sm font-medium text-foreground border-t border-border mt-2 pt-2">
              Logged in as {user.name}
            </div>
          ) : (
            <Link to="/login" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-primary">
              <Github className="h-4 w-4" /> Login with GitHub
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};
