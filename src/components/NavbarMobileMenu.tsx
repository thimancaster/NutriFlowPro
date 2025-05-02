
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Users, Calculator, LogOut, Star, Crown, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUserSubscription } from '@/hooks/useUserSubscription';

interface NavbarMobileMenuProps {
  isAuthenticated: boolean;
  isHomePage?: boolean;
  onLogout: () => Promise<void>;
  onToggleMenu: () => void;
}

const NavbarMobileMenu = ({ isAuthenticated, isHomePage, onLogout, onToggleMenu }: NavbarMobileMenuProps) => {
  const navigate = useNavigate();
  const { data: subscription } = useUserSubscription();
  const isPremium = subscription?.isPremium;

  // Public menu for unauthenticated users
  if (!isAuthenticated) {
    return (
      <div className="md:hidden bg-white shadow-lg animate-fade-in">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {isHomePage ? (
            <>
              <a
                href="#features"
                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-nutri-gray-dark hover:bg-nutri-gray-light hover:text-nutri-green"
                onClick={onToggleMenu}
              >
                Recursos
              </a>
              <a
                href="#pricing"
                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-nutri-gray-dark hover:bg-nutri-gray-light hover:text-nutri-green"
                onClick={onToggleMenu}
              >
                Planos
              </a>
              <a
                href="#testimonials"
                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-nutri-gray-dark hover:bg-nutri-gray-light hover:text-nutri-green"
                onClick={onToggleMenu}
              >
                Depoimentos
              </a>
            </>
          ) : (
            <>
              <Link
                to="/"
                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-nutri-gray-dark hover:bg-nutri-gray-light hover:text-nutri-green"
                onClick={onToggleMenu}
              >
                Início
              </Link>
              <Link
                to="/recursos"
                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-nutri-gray-dark hover:bg-nutri-gray-light hover:text-nutri-green"
                onClick={onToggleMenu}
              >
                Recursos
              </Link>
            </>
          )}
          
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
          
          <Button
            variant="outline"
            className="w-full mt-2 border-nutri-green text-nutri-green hover:bg-nutri-green hover:text-white"
            onClick={() => {
              navigate('/signup');
              onToggleMenu();
            }}
          >
            Criar Conta
          </Button>
        </div>
      </div>
    );
  }

  // Authenticated menu
  return (
    <div className="md:hidden bg-white shadow-lg animate-fade-in">
      {isPremium && (
        <div className="h-1 bg-gradient-to-r from-amber-300 to-yellow-400"></div>
      )}
      <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
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
        {isPremium ? (
          <Link
            to="/subscription"
            className={`flex items-center px-3 py-2 rounded-md text-base font-medium bg-gradient-to-r from-amber-50 to-amber-100 text-amber-800 border-l-4 border-amber-400`}
            onClick={onToggleMenu}
          >
            <Crown className="h-4 w-4 mr-2 text-amber-500" />
            Premium
          </Link>
        ) : (
          <Link
            to="/subscription"
            className="flex items-center px-3 py-2 rounded-md text-base font-medium text-nutri-gray-dark hover:bg-nutri-gray-light hover:text-nutri-green"
            onClick={onToggleMenu}
          >
            <Star className="h-4 w-4 mr-2" />
            Planos
          </Link>
        )}
        <Link
          to="/settings"
          className="flex items-center px-3 py-2 rounded-md text-base font-medium text-nutri-gray-dark hover:bg-nutri-gray-light hover:text-nutri-green"
          onClick={onToggleMenu}
        >
          <Settings className="h-4 w-4 mr-2" />
          Configurações
        </Link>
        <Button
          variant="outline" 
          className="w-full mt-4 border-red-400 text-red-500 hover:bg-red-50"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </div>
    </div>
  );
};

export default NavbarMobileMenu;
