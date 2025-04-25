
import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Calculator, Users, LogOut, Star, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavbarDesktopMenuProps {
  isAuthenticated: boolean;
  onLogin: () => void;
  onLogout: () => Promise<void>;
}

const NavbarDesktopMenu = ({ isAuthenticated, onLogin, onLogout }: NavbarDesktopMenuProps) => {
  return (
    <div className="hidden md:flex items-center space-x-4">
      {isAuthenticated ? (
        <>
          <Link to="/" className="flex items-center px-3 py-2 text-nutri-gray-dark hover:text-nutri-green font-medium">
            <FileText className="h-4 w-4 mr-2" />
            Dashboard
          </Link>
          <Link to="/patients" className="flex items-center px-3 py-2 text-nutri-gray-dark hover:text-nutri-green font-medium">
            <Users className="h-4 w-4 mr-2" />
            Pacientes
          </Link>
          <Link to="/calculator" className="flex items-center px-3 py-2 text-nutri-gray-dark hover:text-nutri-green font-medium">
            <Calculator className="h-4 w-4 mr-2" />
            Calculadora
          </Link>
          <Link to="/meal-plans" className="flex items-center px-3 py-2 text-nutri-gray-dark hover:text-nutri-green font-medium">
            <FileText className="h-4 w-4 mr-2" />
            Planos Alimentares
          </Link>
          <Link to="/subscription" className="flex items-center px-3 py-2 text-nutri-gray-dark hover:text-nutri-green font-medium">
            <Star className="h-4 w-4 mr-2" />
            Planos
          </Link>
          <Link to="/settings" className="flex items-center px-3 py-2 text-nutri-gray-dark hover:text-nutri-green font-medium">
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Link>
          <Button 
            variant="outline" 
            className="border-red-400 text-red-500 hover:bg-red-50"
            onClick={onLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </>
      ) : (
        <>
          <Button 
            variant="default" 
            className="bg-gradient-to-r from-nutri-green to-nutri-green-dark hover:opacity-90"
            onClick={onLogin}
          >
            Entrar
          </Button>
          <Link to="/subscription">
            <Button variant="outline" className="border-nutri-green text-nutri-green hover:bg-nutri-green hover:text-white">
              Ver Planos
            </Button>
          </Link>
        </>
      )}
    </div>
  );
};

export default NavbarDesktopMenu;
