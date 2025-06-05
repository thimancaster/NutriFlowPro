
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

// Import our components
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ThemeProvider } from "@/hooks/theme/use-theme-provider";
import { TourGuide } from "@/components/tour-guide/TourGuide";
import { ToastProvider } from "@/components/ui/toast-provider";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', className: 'dashboard-section', exact: true },
    { name: 'Pacientes', href: '/patients', className: 'patients-link' },
    { name: 'Calculadora', href: '/calculator', className: 'calculator-link', exact: true },
    { name: 'Planos Alimentares', href: '/meal-plans', className: 'meal-plans-link' },
    { name: 'Agendamentos', href: '/appointments', className: 'appointments-link', exact: true },
  ];

  const isActive = (itemHref: string, isExact?: boolean) => {
    if (isExact || itemHref === '/') {
      return location.pathname === itemHref;
    }

    if (location.pathname.startsWith(itemHref)) {
      if (location.pathname === itemHref) return true;
      const afterHref = location.pathname.substring(itemHref.length);
      if (afterHref.startsWith('/')) {
        return true;
      }
    }
    return false;
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleSignOut = async () => {
    await logout();
  };

  return (
    <ThemeProvider>
      <ToastProvider>
        <div className="flex flex-col min-h-screen bg-background dark:bg-dark-bg-primary">
          <TourGuide />
          
          {/* Header aprimorado com glass effect */}
          <header className="border-b border-border bg-background/80 backdrop-blur-md dark:bg-dark-bg-primary/80 dark:border-dark-border-primary sticky top-0 z-50">
            <div className="container mx-auto px-4 flex justify-between items-center h-16">
              <div className="flex items-center">
                <Link to="/dashboard" className="flex items-center nutri-brand group">
                  <span className="text-nutri-green nutri-text transition-colors duration-200 group-hover:text-nutri-green-light dark:text-dark-accent-green">Nutri</span>
                  <span className="text-nutri-blue flow-text transition-colors duration-200 group-hover:text-nutri-blue-light">Flow</span>
                  <span className="text-muted-foreground pro-text ml-1 dark:text-dark-text-muted">Pro</span>
                </Link>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Navigation melhorada */}
                <nav className="hidden md:flex space-x-2">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={cn(
                        "text-sm font-medium transition-all duration-200 hover:text-primary px-3 py-2 rounded-md relative overflow-hidden",
                        isActive(item.href, item.exact)
                          ? "text-primary bg-primary/10 shadow-sm dark:bg-dark-accent-green/10 dark:text-dark-accent-green"
                          : "text-muted-foreground hover:bg-gray-100 dark:text-dark-text-muted dark:hover:bg-dark-bg-elevated/60",
                        item.className
                      )}
                    >
                      <span className="relative z-10">{item.name}</span>
                    </Link>
                  ))}
                </nav>
                
                {/* User Menu aprimorado */}
                {user && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full hover-scale">
                        <Avatar className="h-8 w-8 avatar-enhanced">
                          <AvatarImage src={user.user_metadata?.avatar_url || ''} alt={user.email || ''} />
                          <AvatarFallback className="bg-gradient-to-br from-nutri-green/20 to-nutri-blue/20 dark:bg-dark-bg-elevated dark:text-dark-text-primary">
                            {user.email?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 dropdown-content glass-effect" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none text-foreground dark:text-dark-text-primary">
                            {user.user_metadata?.name || user.email}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground dark:text-dark-text-muted">
                            {user.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="border-border dark:border-dark-border-primary" />
                      <DropdownMenuItem asChild>
                        <Link to="/profile" className="cursor-pointer text-foreground hover:bg-accent dark:text-dark-text-primary dark:hover:bg-dark-bg-elevated/60 transition-colors duration-200">
                          <User className="mr-2 h-4 w-4" />
                          <span>Perfil</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="border-border dark:border-dark-border-primary" />
                      <DropdownMenuItem 
                        onClick={handleSignOut} 
                        className="cursor-pointer text-foreground hover:bg-accent dark:text-dark-text-primary dark:hover:bg-dark-bg-elevated/60 transition-colors duration-200"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sair</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                
                {/* Mobile menu button aprimorado */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden text-foreground hover:bg-accent dark:text-dark-text-primary dark:hover:bg-dark-bg-elevated/60 transition-all duration-200 hover-scale"
                  onClick={toggleMobileMenu}
                >
                  {mobileMenuOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </Button>
                
                {/* Theme toggle aprimorado */}
                <ThemeToggle />
              </div>
            </div>
            
            {/* Mobile Navigation aprimorada */}
            {mobileMenuOpen && (
              <div className="md:hidden py-4 px-4 border-t border-border bg-background/95 backdrop-blur-md dark:bg-dark-bg-secondary/95 dark:border-dark-border-primary">
                <nav className="flex flex-col space-y-2">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={cn(
                        "text-sm font-medium transition-all duration-200 hover:text-primary p-3 rounded-md",
                        isActive(item.href, item.exact)
                          ? "bg-primary/10 text-primary dark:bg-dark-accent-green/10 dark:text-dark-accent-green"
                          : "text-muted-foreground hover:bg-gray-100 dark:text-dark-text-muted dark:hover:bg-dark-bg-elevated/60",
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
          
          {/* Main content com gradiente sutil */}
          <main className="flex-1 bg-background dark:bg-dark-bg-primary">
            <div className="container mx-auto px-4 py-6">
              <BreadcrumbNav />
              {children}
            </div>
          </main>
          
          {/* Footer refinado */}
          <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground bg-background/80 backdrop-blur-md dark:bg-dark-bg-primary/80 dark:border-dark-border-primary">
            <div className="container mx-auto px-4">
              <p className="text-muted-foreground dark:text-dark-text-muted">
                © {new Date().getFullYear()} NutriFlow Pro. Todos os direitos reservados.
              </p>
            </div>
          </footer>
        </div>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default Layout;
