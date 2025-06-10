import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Settings, Book, RefreshCw, PenLine, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const isLandingPage = location.pathname === '/';

  const links = [
    { name: 'Dashboard', path: '/dashboard', icon: Book },
    { name: 'Classroom', path: '/classroom', icon: PenLine },
    { name: 'Revise Room', path: '/reviseroom', icon: RefreshCw },
    { name: 'Test Room', path: '/testroom', icon: Settings },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Book className="h-6 w-6" />
            <span className="font-display text-xl font-bold">Campus Sorcery</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {!isLandingPage && user && (
              <>
                {links.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`nav-link ${isActive(link.path) ? 'active' : ''}`}
                  >
                    {link.name}
                  </Link>
                ))}
              </>
            )}
            
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/profile">
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/auth">
                  <Button>Sign In</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Navigation Button */}
          <div className="flex md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="space-y-1 px-2 pb-3 pt-2">
            {!isLandingPage && user && (
              <>
                {links.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      isActive(link.path)
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground hover:bg-muted'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
              </>
            )}
            
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-muted"
                  onClick={() => setIsOpen(false)}
                >
                  Profile
                </Link>
                <button
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-muted"
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-muted"
                onClick={() => setIsOpen(false)}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
