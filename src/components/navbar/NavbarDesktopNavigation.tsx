
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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

const NavbarDesktopNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

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

  return (
    <nav className="hidden md:flex items-center space-x-6">
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive = isActivePath(item.path);
        
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
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
    </nav>
  );
};

export default NavbarDesktopNavigation;
