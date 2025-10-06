import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/AuthContext';
import { navigationItems } from '@/config/navigation';
import NavbarDesktopNavigation from './navbar/NavbarDesktopNavigation';
import NavbarMobileMenu from './navbar/NavbarMobileMenu';
import NavbarUserMenu from './navbar/NavbarUserMenu';
import { Button } from './ui/button';

const authLinks = [
  { name: 'Recursos', href: '/recursos' },
  { name: 'Preços', href: '/pricing' },
];

export default function Navbar() {
  const { user } = useAuth();

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
            <NavbarUserMenu />
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
                {/* ESTA É A CORREÇÃO PRINCIPAL */}
                <Link to="/login">Logar</Link>
              </Button>
            </nav>
          )}
          <NavbarMobileMenu
            mainNavItems={user ? navigationItems : authLinks}
            isLoggedIn={!!user}
          />
        </div>
      </div>
    </header>
  );
}
