
import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import NavbarBrand from './NavbarBrand';
import NavbarDesktopMenu from './NavbarDesktopMenu';
import NavbarMobileMenu from './NavbarMobileMenu';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation();
  
  // Check if we're on the home page (landing page)
  const isHomePage = location.pathname === '/';
  // Check if we're on a public page (login, signup, forgot password, recursos)
  const isPublicPage = ['/login', '/signup', '/forgot-password', '/recursos'].includes(location.pathname);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleLogout = async () => {
    console.log("Botão de logout clicado");
    
    try {
      // Prevenir múltiplos cliques
      if (isLoggingOut) {
        console.log("Processo de logout já em andamento, ignorando clique");
        return;
      }
      
      setIsLoggingOut(true);
      
      // Forçar fechamento do menu antes do logout
      if (isMenuOpen) {
        setIsMenuOpen(false);
      }
      
      toast({
        title: "Saindo...",
        description: "Encerrando sua sessão.",
      });
      
      const result = await logout();
      
      if (result.success) {
        console.log("Logout bem-sucedido, redirecionando para login");
        // Use React Router navigation
        navigate('/login');
      } else {
        console.error("Logout retornou false sem erro:", result);
        // Forçar navegação mesmo assim
        navigate('/login');
      }
    } catch (error: any) {
      console.error("Erro ao fazer logout:", error);
      // Forçar navegação mesmo com erro
      navigate('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  // For home page with landing page, use a transparent background with shadow on scroll
  const navbarClass = isHomePage && !isAuthenticated 
    ? "bg-white bg-opacity-95 shadow-md backdrop-blur-sm sticky top-0 z-50" 
    : "bg-white shadow-md";

  return (
    <nav className={navbarClass}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <NavbarBrand />
          </div>
          
          <NavbarDesktopMenu 
            isAuthenticated={isAuthenticated}
            isHomePage={isHomePage}
            onLogin={handleLoginClick}
            onLogout={handleLogout}
            isLoggingOut={isLoggingOut}
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
          isHomePage={isHomePage}
          onLogout={handleLogout}
          onToggleMenu={toggleMenu}
          isLoggingOut={isLoggingOut}
        />
      )}
    </nav>
  );
};

export default Navbar;
