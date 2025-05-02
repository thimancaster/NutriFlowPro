
import React from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface NavbarMobileMenuProps {
  isAuthenticated: boolean;
  isHomePage: boolean;
  onLogout: () => void;
  onToggleMenu: () => void;
  isLoggingOut: boolean;
}

const NavbarMobileMenu = ({
  isAuthenticated,
  isHomePage,
  onLogout,
  onToggleMenu,
  isLoggingOut
}: NavbarMobileMenuProps) => {
  return (
    <div className="md:hidden">
      <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white shadow-lg">
        {isAuthenticated ? (
          <>
            <Link 
              to="/dashboard" 
              className="block px-3 py-2 rounded-md text-base font-medium text-nutri-blue hover:text-nutri-green"
              onClick={onToggleMenu}
            >
              Dashboard
            </Link>
            <Link 
              to="/patients" 
              className="block px-3 py-2 rounded-md text-base font-medium text-nutri-blue hover:text-nutri-green"
              onClick={onToggleMenu}
            >
              Pacientes
            </Link>
            <Link 
              to="/calculator" 
              className="block px-3 py-2 rounded-md text-base font-medium text-nutri-blue hover:text-nutri-green"
              onClick={onToggleMenu}
            >
              Calculadora
            </Link>
            <Link 
              to="/meal-plans" 
              className="block px-3 py-2 rounded-md text-base font-medium text-nutri-blue hover:text-nutri-green"
              onClick={onToggleMenu}
            >
              Planos
            </Link>
            <Link 
              to="/settings" 
              className="block px-3 py-2 rounded-md text-base font-medium text-nutri-blue hover:text-nutri-green"
              onClick={onToggleMenu}
            >
              Configurações
            </Link>
            <div
              className="block px-3 py-2 rounded-md text-base font-medium text-nutri-red hover:bg-nutri-red hover:text-white cursor-pointer"
              onClick={() => {
                onToggleMenu();
                onLogout();
              }}
            >
              {isLoggingOut ? (
                <div className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saindo...
                </div>
              ) : (
                'Sair'
              )}
            </div>
          </>
        ) : (
          <>
            {/* For landing page */}
            {isHomePage && (
              <>
                <Link 
                  to="/login" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-nutri-blue hover:text-nutri-green"
                  onClick={onToggleMenu}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-nutri-green hover:text-nutri-green-dark"
                  onClick={onToggleMenu}
                >
                  Criar Conta
                </Link>
              </>
            )}
            
            {/* For login/register pages */}
            {!isHomePage && (
              <Link 
                to="/" 
                className="block px-3 py-2 rounded-md text-base font-medium text-nutri-blue hover:text-nutri-green"
                onClick={onToggleMenu}
              >
                Voltar para Home
              </Link>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NavbarMobileMenu;
