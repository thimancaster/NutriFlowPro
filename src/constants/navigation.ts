
import { Home, Users, Calculator, Calendar, Settings, FileText } from 'lucide-react';

export const navigationItems = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Pacientes', href: '/patients', icon: Users },
  { name: 'Cálculos', href: '/calculations', icon: Calculator },
  { name: 'Planos Alimentares', href: '/meal-plans', icon: FileText },
  { name: 'Agenda', href: '/calendar', icon: Calendar },
  { name: 'Configurações', href: '/settings', icon: Settings },
];
