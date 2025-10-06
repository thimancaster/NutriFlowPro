
import React from 'react';
import { 
  Home, 
  Users, 
  Calculator, 
  Utensils, 
  FileText, 
  Calendar, 
  BarChart3, 
  Settings, 
  Star 
} from 'lucide-react';

export const navigationItems = [
  {
    title: 'Dashboard',
    icon: Home,
    href: '/dashboard',
    description: 'Visão geral do sistema'
  },
  {
    title: 'Pacientes',
    icon: Users,
    href: '/patients',
    description: 'Gerenciar pacientes'
  },
  {
    title: 'Consulta',
    icon: FileText,
    href: '/consultation',
    description: 'Fluxo completo de consulta nutricional'
  },
  {
    title: 'Calculadora',
    icon: Calculator,
    href: '/calculator',
    description: 'Cálculos nutricionais'
  },
  {
    title: 'Planos Alimentares',
    icon: Utensils,
    href: '/meal-plans',
    description: 'Gerenciar planos alimentares'
  },
  {
    title: 'Agendamentos',
    icon: Calendar,
    href: '/appointments',
    description: 'Agenda de consultas'
  },
  {
    title: 'Relatórios',
    icon: BarChart3,
    href: '/analytics',
    description: 'Análises e relatórios'
  },
  {
    title: 'Configurações',
    icon: Settings,
    href: '/settings',
    description: 'Configurações do sistema'
  },
  {
    title: 'Depoimentos',
    icon: Star,
    href: '/testimonials',
    description: 'Depoimentos de pacientes'
  }
];
