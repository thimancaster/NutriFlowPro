
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface NavbarDesktopMenuProps {
  isAuthenticated: boolean;
  isHomePage: boolean;
  onLogin: () => void;
  onLogout: () => void;
  isLoggingOut: boolean;
}

const NavbarDesktopMenu = ({
  isAuthenticated,
  isHomePage,
  onLogin,
  onLogout,
  isLoggingOut
}: NavbarDesktopMenuProps) => {
  return (
    <div className="hidden md:flex items-center">
      {isAuthenticated ? (
        <>
          <Link to="/dashboard" className="text-nutri-blue hover:text-nutri-green px-3 py-2 rounded-md text-sm font-medium">
            Dashboard
          </Link>
          <Link to="/patients" className="text-nutri-blue hover:text-nutri-green px-3 py-2 rounded-md text-sm font-medium">
            Pacientes
          </Link>
          <Link to="/calculator" className="text-nutri-blue hover:text-nutri-green px-3 py-2 rounded-md text-sm font-medium">
            Calculadora
          </Link>
          <Link to="/meal-plans" className="text-nutri-blue hover:text-nutri-green px-3 py-2 rounded-md text-sm font-medium">
            Planos
          </Link>
          <Link to="/settings" className="text-nutri-blue hover:text-nutri-green px-3 py-2 rounded-md text-sm font-medium">
            Configurações
          </Link>
          <Button 
            variant="outline" 
            onClick={onLogout}
            disabled={isLoggingOut}
            className="ml-4 border-nutri-red text-nutri-red hover:bg-nutri-red hover:text-white"
          >
            {isLoggingOut ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saindo...
              </>
            ) : (
              'Sair'
            )}
          </Button>
        </>
      ) : (
        <>
          {/* For landing page */}
          {isHomePage && (
            <>
              <Link to="/login" className="text-nutri-blue hover:text-nutri-green px-3 py-2 rounded-md text-sm font-medium">
                Login
              </Link>
              <Link to="/register">
                <Button className="ml-4 bg-nutri-green hover:bg-nutri-green-dark text-white">
                  Criar Conta
                </Button>
              </Link>
            </>
          )}
          
          {/* For login/register pages */}
          {!isHomePage && (
            <Link to="/">
              <Button variant="outline" className="ml-4 border-nutri-blue text-nutri-blue hover:bg-nutri-blue hover:text-white">
                Voltar para Home
              </Button>
            </Link>
          )}
        </>
      )}
    </div>
  );
};

export default NavbarDesktopMenu;
