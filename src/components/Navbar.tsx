
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';
import NavbarDesktop from './navbar/NavbarDesktop';
import NavbarMobile from './navbar/NavbarMobile';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      toast({
        title: 'Logout realizado com sucesso',
        description: 'Você foi desconectado da sua conta.',
      });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast({
        title: 'Erro ao fazer logout',
        description: 'Ocorreu um erro ao tentar desconectar.',
        variant: 'destructive',
      });
    }
  };

  return (
    <nav className="bg-nutri-green shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <span className="text-white font-bold text-xl">NutriFlow Pro</span>
            </Link>
          </div>

          {isAuthenticated && (
            <>
              <NavbarDesktop onLogout={handleLogout} />
              
              <div className="md:hidden">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="bg-nutri-green inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-nutri-green focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                >
                  <Menu className="h-6 w-6" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {isAuthenticated && (
        <NavbarMobile isOpen={isOpen} onClose={() => setIsOpen(false)} />
      )}
    </nav>
  );
};

export default Navbar;
