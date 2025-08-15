
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Calculator, 
  Calendar, 
  ChefHat, 
  Settings, 
  LogOut,
  User,
  FileSpreadsheet
} from 'lucide-react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { usePatient } from '@/contexts/patient/PatientContext';
import { Button } from '@/components/ui/button';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Pacientes', href: '/patients', icon: Users },
  { name: 'Calculadora', href: '/calculator', icon: Calculator },
  { name: 'Calculadora Planilha', href: '/planilha-calculator', icon: FileSpreadsheet },
  { name: 'Planos Alimentares', href: '/meal-plans', icon: ChefHat },
  { name: 'Consultas', href: '/appointments', icon: Calendar },
  { name: 'Configurações', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const { user, signOut } = useAuth();
  const { activePatient, endPatientSession } = usePatient();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      if (activePatient) {
        endPatientSession();
      }
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="flex h-full w-64 flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">
          NutriFlow Pro
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                    : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                }`
              }
            >
              <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      {/* Active Patient */}
      {activePatient && (
        <div className="px-3 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
            <div className="flex items-center">
              <User className="h-4 w-4 text-green-600 dark:text-green-400 mr-2" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-green-700 dark:text-green-300 truncate">
                  Paciente Ativo
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 truncate">
                  {activePatient.name}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-2 text-green-600 hover:text-green-700 dark:text-green-400"
              onClick={endPatientSession}
            >
              Finalizar Sessão
            </Button>
          </div>
        </div>
      )}

      {/* User Info & Sign Out */}
      <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {user?.name || user?.email}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user?.email}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
