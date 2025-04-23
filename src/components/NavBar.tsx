
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Book, RefreshCw, PenLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UserMenu from './UserMenu';
import { useAuth } from '@clerk/clerk-react';

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { isSignedIn } = useAuth();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const links = [
    { name: 'Dashboard', path: '/dashboard', icon: Book },
    { name: 'Classroom', path: '/classroom', icon: PenLine },
    { name: 'Revise Room', path: '/reviseroom', icon: RefreshCw },
  ];

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-opacity-80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to={isSignedIn ? "/dashboard" : "/"} className="flex items-center">
              <span className="font-display text-xl text-primary font-semibold">acampus<span className="text-accent-foreground">ai</span></span>
            </Link>
          </div>
          
          {isSignedIn && (
            <>
              <div className="hidden md:block">
                <div className="flex items-center space-x-4">
                  {links.map((link) => (
                    <Link
                      key={link.name}
                      to={link.path}
                      className={`nav-link flex items-center ${isActive(link.path) ? 'active' : ''}`}
                    >
                      <link.icon className="w-4 h-4 mr-2" />
                      {link.name}
                    </Link>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center">
                <UserMenu />
                <div className="md:hidden ml-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Toggle menu"
                  >
                    {isOpen ? (
                      <X className="w-5 h-5" />
                    ) : (
                      <Menu className="w-5 h-5" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
          
          {!isSignedIn && (
            <div className="flex gap-2">
              <Link to="/sign-in">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link to="/sign-up">
                <Button size="sm">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile menu */}
      {isOpen && isSignedIn && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-card animate-fade-in">
            {links.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive(link.path)
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                } flex items-center`}
                onClick={() => setIsOpen(false)}
              >
                <link.icon className="w-4 h-4 mr-2" />
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
