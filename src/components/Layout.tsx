
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { LogOut, Menu, User, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// Import our new components
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ThemeProvider } from "@/hooks/theme/use-theme-provider";
import { TourGuide } from "@/components/tour-guide/TourGuide";
import { ToastProvider } from "@/components/ui/toast-provider";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth(); // Changed from signOut to logout
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', className: 'dashboard-section' },
    { name: 'Pacientes', href: '/patients', className: 'patients-link' },
    { name: 'Calculadora', href: '/calculator', className: 'calculator-link' },
    { name: 'Planos Alimentares', href: '/meal-plans', className: 'meal-plans-link' },
    { name: 'Agendamentos', href: '/appointments', className: 'appointments-link' },
  ];

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleSignOut = async () => {
    await logout(); // Changed from signOut to logout
  };

  return (
    <ThemeProvider>
      <ToastProvider>
        <div className="flex flex-col min-h-screen">
          {/* Add our tour guide component */}
          <TourGuide />
          
          {/* Keep existing navbar, but add theme toggle */}
          <header className="border-b">
            <div className="container mx-auto px-4 flex justify-between items-center h-16">
              <div className="flex items-center">
                <Link to="/dashboard" className="flex items-center">
                  <span className="text-xl font-bold text-primary">NutriFlow</span>
                  <span className="text-sm font-semibold ml-1 text-muted-foreground">Pro</span>
                </Link>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Desktop Navigation */}
                <nav className="hidden md:flex space-x-4">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={cn(
                        "text-sm font-medium transition-colors hover:text-primary",
                        isActive(item.href)
                          ? "text-primary"
                          : "text-muted-foreground",
                        item.className
                      )}
                    >
                      {item.name}
                    </Link>
                  ))}
                </nav>
                
                {/* User Menu */}
                {user && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.user_metadata?.avatar_url || ''} alt={user.email || ''} />
                          <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{user.user_metadata?.name || user.email}</p>
                          <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/profile" className="cursor-pointer">
                          <User className="mr-2 h-4 w-4" />
                          <span>Perfil</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sair</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                
                {/* Mobile menu button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={toggleMobileMenu}
                >
                  {mobileMenuOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </Button>
                
                {/* Add theme toggle button */}
                <ThemeToggle />
              </div>
            </div>
            
            {/* Mobile Navigation */}
            {mobileMenuOpen && (
              <div className="md:hidden py-2 px-4 border-t">
                <nav className="flex flex-col space-y-2">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={cn(
                        "text-sm font-medium transition-colors hover:text-primary p-2 rounded-md",
                        isActive(item.href)
                          ? "bg-secondary text-primary"
                          : "text-muted-foreground",
                        item.className
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </div>
            )}
          </header>
          
          <main className="flex-1">
            <div className="container mx-auto px-4 py-6">
              {/* Add breadcrumb navigation */}
              <BreadcrumbNav />
              
              {/* Render the main content */}
              {children}
            </div>
          </main>
          
          <footer className="border-t py-4 text-center text-sm text-muted-foreground">
            <div className="container mx-auto px-4">
              <p>© {new Date().getFullYear()} NutriFlow Pro. Todos os direitos reservados.</p>
            </div>
          </footer>
        </div>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default Layout;
