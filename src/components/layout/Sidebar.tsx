
import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Users, 
  Calculator, 
  Utensils, 
  Calendar, 
  BarChart3, 
  Settings, 
  Star,
  Workflow
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
}

const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Pacientes', href: '/patients', icon: Users },
  { name: 'Calculadora', href: '/calculator', icon: Calculator },
  { name: 'Workflow Nutricional', href: '/nutrition-workflow', icon: Workflow },
  { name: 'Planos Alimentares', href: '/meal-plans', icon: Utensils },
  { name: 'Agendamentos', href: '/appointments', icon: Calendar },
  { name: 'Configurações', href: '/settings', icon: Settings },
  { name: 'Depoimentos', href: '/testimonials', icon: Star }
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  return (
    <aside
      className={cn(
        "fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 transform bg-white shadow-sm transition-transform duration-200 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "lg:translate-x-0"
      )}
    >
      <div className="flex h-full flex-col overflow-y-auto px-3 py-4">
        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-nutri-green text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  )
                }
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
