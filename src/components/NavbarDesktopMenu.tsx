
import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Calculator, Users, LogOut, Star, Settings, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUserSubscription } from '@/hooks/useUserSubscription';

interface NavbarDesktopMenuProps {
  isAuthenticated: boolean;
  isHomePage?: boolean;
  onLogin: () => void;
  onLogout: () => Promise<void>;
}

const NavbarDesktopMenu = ({ isAuthenticated, isHomePage, onLogin, onLogout }: NavbarDesktopMenuProps) => {
  const { data: subscription, refetchSubscription } = useUserSubscription();
  const isPremium = subscription?.isPremium;
  
  // Refetch subscription when menu renders if authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      refetchSubscription();
    }
  }, [isAuthenticated, refetchSubscription]);
  
  // Public menu for unauthenticated users
  if (!isAuthenticated) {
    return (
      <div className="hidden md:flex items-center space-x-4">
        {isHomePage ? (
          <>
            <a href="#features" className="px-3 py-2 text-nutri-gray-dark hover:text-nutri-green font-medium">
              Recursos
            </a>
            <a href="#pricing" className="px-3 py-2 text-nutri-gray-dark hover:text-nutri-green font-medium">
              Planos
            </a>
            <a href="#testimonials" className="px-3 py-2 text-nutri-gray-dark hover:text-nutri-green font-medium">
              Depoimentos
            </a>
            <Button 
              variant="default" 
              className="bg-gradient-to-r from-nutri-green to-nutri-green-dark hover:opacity-90"
              onClick={onLogin}
            >
              Entrar
            </Button>
            <Link to="/signup">
              <Button variant="outline" className="border-nutri-green text-nutri-green hover:bg-nutri-green hover:text-white">
                Criar Conta
              </Button>
            </Link>
          </>
        ) : (
          <>
            <Link to="/" className="px-3 py-2 text-nutri-gray-dark hover:text-nutri-green font-medium">
              Início
            </Link>
            <Link to="/recursos" className="px-3 py-2 text-nutri-gray-dark hover:text-nutri-green font-medium">
              Recursos
            </Link>
            <Button 
              variant="default" 
              className="bg-gradient-to-r from-nutri-green to-nutri-green-dark hover:opacity-90"
              onClick={onLogin}
            >
              Entrar
            </Button>
            <Link to="/signup">
              <Button variant="outline" className="border-nutri-green text-nutri-green hover:bg-nutri-green hover:text-white">
                Criar Conta
              </Button>
            </Link>
          </>
        )}
      </div>
    );
  }
  
  // Authenticated menu
  return (
    <div className="hidden md:flex items-center space-x-4">
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
      {isPremium ? (
        <Link 
          to="/subscription" 
          className="flex items-center px-3 py-2 bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 rounded-md border border-amber-200 hover:border-amber-300 font-medium transition-all"
        >
          <Crown className="h-4 w-4 mr-2 text-amber-500" />
          Premium
        </Link>
      ) : (
        <Link 
          to="/subscription" 
          className="flex items-center px-3 py-2 text-nutri-gray-dark hover:text-nutri-green font-medium"
        >
          <Star className="h-4 w-4 mr-2" />
          Planos
        </Link>
      )}
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
    </div>
  );
};

export default NavbarDesktopMenu;
