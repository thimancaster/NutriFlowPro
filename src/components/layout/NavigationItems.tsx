
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
    title: 'Atendimento',
    icon: FileText,
    href: '/atendimento',
    description: 'Fluxo completo de atendimento nutricional'
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
    href: '/reports',
    description: 'Evolução e análises comparativas'
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
