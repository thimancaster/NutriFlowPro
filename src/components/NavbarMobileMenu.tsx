
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Users, Calculator, LogOut, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavbarMobileMenuProps {
  isAuthenticated: boolean;
  onLogout: () => Promise<void>;
  onToggleMenu: () => void;
}

const NavbarMobileMenu = ({ isAuthenticated, onLogout, onToggleMenu }: NavbarMobileMenuProps) => {
  const navigate = useNavigate();

  return (
    <div className="md:hidden bg-white shadow-lg animate-fade-in">
      <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
        {isAuthenticated ? (
          <>
            <Link
              to="/"
              className="flex items-center px-3 py-2 rounded-md text-base font-medium text-nutri-gray-dark hover:bg-nutri-gray-light hover:text-nutri-green"
              onClick={onToggleMenu}
            >
              <FileText className="h-4 w-4 mr-2" />
              Dashboard
            </Link>
            <Link
              to="/patients"
              className="flex items-center px-3 py-2 rounded-md text-base font-medium text-nutri-gray-dark hover:bg-nutri-gray-light hover:text-nutri-green"
              onClick={onToggleMenu}
            >
              <Users className="h-4 w-4 mr-2" />
              Pacientes
            </Link>
            <Link
              to="/calculator"
              className="flex items-center px-3 py-2 rounded-md text-base font-medium text-nutri-gray-dark hover:bg-nutri-gray-light hover:text-nutri-green"
              onClick={onToggleMenu}
            >
              <Calculator className="h-4 w-4 mr-2" />
              Calculadora
            </Link>
            <Link
              to="/meal-plans"
              className="flex items-center px-3 py-2 rounded-md text-base font-medium text-nutri-gray-dark hover:bg-nutri-gray-light hover:text-nutri-green"
              onClick={onToggleMenu}
            >
              <FileText className="h-4 w-4 mr-2" />
              Planos Alimentares
            </Link>
            <Link
              to="/subscription"
              className="flex items-center px-3 py-2 rounded-md text-base font-medium text-nutri-gray-dark hover:bg-nutri-gray-light hover:text-nutri-green"
              onClick={onToggleMenu}
            >
              <Star className="h-4 w-4 mr-2" />
              Planos
            </Link>
            <Button
              variant="outline" 
              className="w-full mt-4 border-red-400 text-red-500 hover:bg-red-50"
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
              className="w-full mt-4 bg-gradient-to-r from-nutri-green to-nutri-green-dark hover:opacity-90"
              onClick={() => {
                navigate('/login');
                onToggleMenu();
              }}
            >
              Entrar
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default NavbarMobileMenu;
