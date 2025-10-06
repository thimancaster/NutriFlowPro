import {
  LayoutDashboard,
  Users,
  Calendar,
  Calculator,
  Utensils,
  FileText,
  Settings,
  CreditCard,
  Bug
} from 'lucide-react';

export const navigationItems = [
  {
    name: 'Dashboard',
    href: '/app',
    icon: LayoutDashboard,
  },
  {
    name: 'Pacientes',
    href: '/app/patients',
    icon: Users,
  },
  {
    name: 'Agendamentos',
    href: '/app/appointments',
    icon: Calendar,
  },
  {
    name: 'Calculadora',
    href: '/app/calculator',
    icon: Calculator,
  },
  {
    name: 'Planos Alimentares',
    href: '/app/meal-plans',
    icon: Utensils,
  },
  {
    name: 'Consulta',
    href: '/app/clinical',
    icon: FileText,
  },
  {
    name: 'Configurações',
    href: '/app/settings',
    icon: Settings,
  },
  {
    name: 'Assinatura',
    href: '/app/subscription',
    icon: CreditCard,
  },
  {
    name: 'Debug',
    href: '/app/debug',
    icon: Bug,
  },
];
