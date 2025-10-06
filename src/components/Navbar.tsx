import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { navigationItems } from '@/config/navigation';
import NavbarDesktopNavigation from './navbar/NavbarDesktopNavigation';
import NavbarMobileMenu from './navbar/NavbarMobileMenu';
import NavbarUserMenu from './navbar/NavbarUserMenu';
import { Button } from './ui/button';
import { toast } from 'sonner';

const authLinks = [
  { name: 'Recursos', href: '/recursos' },
  { name: 'Preços', href: '/pricing' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logout realizado com sucesso');
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast.error('Erro ao fazer logout');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">NutriFlow Pro</span>
          </Link>
          {user && <NavbarDesktopNavigation navigationItems={navigationItems} />}
        </div>

        <div className="flex flex-1 items-center justify-end space-x-2">
          {user ? (
            <>
              <NavbarUserMenu onLogout={handleLogout} />
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </>
          ) : (
            <nav className="hidden md:flex items-center space-x-1">
              {authLinks.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-primary"
                >
                  {item.name}
                </Link>
              ))}
              <Button asChild>
                <Link to="/login">Logar</Link>
              </Button>
            </nav>
          )}
        </div>
      </div>
      {user && (
        <NavbarMobileMenu
          navigationItems={navigationItems}
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />
      )}
    </header>
  );
}
