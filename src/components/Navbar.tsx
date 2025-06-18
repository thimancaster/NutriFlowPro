
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/AuthContext';
import NavbarBrand from './NavbarBrand';
import NavbarMobileMenu from './NavbarMobileMenu';
import NavbarDesktopMenu from './NavbarDesktopMenu';
import { Button } from '@/components/ui/button';
import { User, Menu, X, Home, Users, FileText, Calculator, Coffee, Settings, CalendarDays } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    closeMobileMenu();
  };

  const navigationItems = [
    { name: 'Início', path: '/dashboard', icon: <Home className="h-5 w-5" /> },
    { name: 'Pacientes', path: '/patients', icon: <Users className="h-5 w-5" /> },
    { name: 'Agendamentos', path: '/appointments', icon: <CalendarDays className="h-5 w-5" /> },
    { name: 'Consultas', path: '/clinical', icon: <FileText className="h-5 w-5" /> },
    { name: 'Calculadora', path: '/calculator', icon: <Calculator className="h-5 w-5" /> },
    { name: 'Planos Alimentares', path: '/meal-plans', icon: <Coffee className="h-5 w-5" /> },
    { name: 'Configurações', path: '/settings', icon: <Settings className="h-5 w-5" /> }
  ];

  return (
    <nav className="bg-white shadow-sm dark:bg-slate-800 dark:border-b dark:border-slate-600 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <NavbarBrand />
          </div>

          {/* Desktop nav menu */}
          {isAuthenticated && (
            <NavbarDesktopMenu 
              navigationItems={navigationItems} 
              onLogout={handleLogout}
            />
          )}

          {/* Mobile menu button */}
          {isAuthenticated && (
            <div className="flex items-center md:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-slate-300 hover:text-nutri-blue dark:hover:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-700/50 focus:outline-none transition-colors duration-200"
                aria-controls="mobile-menu"
                aria-expanded="false"
                onClick={toggleMobileMenu}
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
              </button>
            </div>
          )}

          {/* Login / Register buttons for non-authenticated users */}
          {!isAuthenticated && (
            <div className="flex items-center">
              <Link to="/login">
                <Button variant="ghost" className="text-gray-700 dark:text-slate-300 hover:text-nutri-blue dark:hover:text-slate-100 mr-2 transition-colors duration-200">
                  <User className="h-5 w-5 mr-1" />
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-nutri-blue hover:bg-nutri-blue-dark text-white transition-colors duration-200">
                  Cadastrar
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {isAuthenticated && (
        <NavbarMobileMenu
          isOpen={isMobileMenuOpen}
          navigationItems={navigationItems}
          onClose={closeMobileMenu}
          onLogout={handleLogout}
        />
      )}
    </nav>
  );
};

export default Navbar;
