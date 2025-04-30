
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuthState } from '@/hooks/useAuthState';
import NavbarBrand from './NavbarBrand';
import NavbarDesktopMenu from './NavbarDesktopMenu';
import NavbarMobileMenu from './NavbarMobileMenu';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuthState();
  const navigate = useNavigate();
  const { toast } = useToast();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleLogout = async () => {
    try {
      const result = await logout();
      
      if (result.success) {
        // O toast já é mostrado pelo hook useAuthState
        navigate('/login');
      }
    } catch (error: any) {
      console.error("Erro ao fazer logout:", error);
      toast({
        title: "Erro ao fazer logout",
        description: error.message || "Ocorreu um erro ao tentar desconectar.",
        variant: "destructive"
      });
    }
    toggleMenu();
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <NavbarBrand />
          </div>
          
          <NavbarDesktopMenu 
            isAuthenticated={isAuthenticated}
            onLogin={handleLoginClick}
            onLogout={handleLogout}
          />
          
          <div className="flex md:hidden items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-nutri-gray-dark hover:text-nutri-green"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <NavbarMobileMenu 
          isAuthenticated={isAuthenticated}
          onLogout={handleLogout}
          onToggleMenu={toggleMenu}
        />
      )}
    </nav>
  );
};

export default Navbar;
