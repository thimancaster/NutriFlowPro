
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Users, 
  Calculator, 
  Utensils, 
  Calendar,
  FileText,
  Database,
  Settings
} from 'lucide-react';

const NavbarMobileMenu = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);

  const navigationItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/patients', label: 'Pacientes', icon: Users },
    { path: '/consultation', label: 'Consulta', icon: FileText }, // Unified consultation flow
    { path: '/calculator', label: 'Calculadora', icon: Calculator },
    { path: '/meal-plans', label: 'Planos', icon: Utensils },
    { path: '/appointments', label: 'Agenda', icon: Calendar },
    { path: '/food-database', label: 'Alimentos', icon: Database },
    { path: '/settings', label: 'Configurações', icon: Settings },
  ];

  const isActivePath = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64">
        <div className="flex flex-col space-y-2 mt-6">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActivePath(item.path);
            
            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors w-full text-left",
                  isActive
                    ? "bg-nutri-green text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default NavbarMobileMenu;
