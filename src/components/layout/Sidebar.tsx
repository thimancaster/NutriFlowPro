import React from 'react';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  UtensilsCrossed,
  FileText,
  Settings,
  Calendar,
  Calculator,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { usePatient } from '@/contexts/patient/PatientContext';
import { Badge } from '@/components/ui/badge';

interface SidebarItem {
  icon: React.ComponentType<any>;
  label: string;
  href: string;
  badge?: string;
}

const sidebarItems = [
  {
    icon: LayoutDashboard,
    label: 'Dashboard',
    href: '/dashboard',
  },
  {
    icon: Users,
    label: 'Pacientes',
    href: '/patients',
  },
  {
    icon: Calculator,
    label: 'Calculadora',
    href: '/calculator',
  },
  {
    icon: Calculator,
    label: 'Planilha (Novo)',
    href: '/planilha-calculator',
    badge: 'Fase 1'
  },
  {
    icon: CalendarDays,
    label: 'Consultas',
    href: '/consultations',
  },
  {
    icon: UtensilsCrossed,
    label: 'Planos Alimentares',
    href: '/meal-plans',
  },
  {
    icon: Calendar,
    label: 'Agenda',
    href: '/appointments',
  },
  {
    icon: FileText,
    label: 'Relatórios',
    href: '/reports',
  },
  {
    icon: Settings,
    label: 'Configurações',
    href: '/settings',
  },
];

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const { clearActivePatient } = usePatient();

  const handleLogout = async () => {
    await logout();
    clearActivePatient();
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 border-r py-4">
      <div className="px-4 mb-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.email} />
                <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Sair</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <nav className="flex-grow">
        <ul>
          {sidebarItems.map((item) => (
            <li key={item.label}>
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 text-gray-700 hover:bg-gray-200 ${
                    isActive ? 'font-semibold bg-gray-200' : ''
                  }`
                }
              >
                <item.icon className="w-4 h-4 mr-2" />
                {item.label}
                {item.badge && (
                  <Badge className="ml-auto">{item.badge}</Badge>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 text-center text-xs text-gray-500">
        NutriFlow Pro &copy; {new Date().getFullYear()}
      </div>
    </div>
  );
};

export default Sidebar;
