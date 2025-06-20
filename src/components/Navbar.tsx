import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { LogOut, Menu, User, Zap } from 'lucide-react';

const Navbar = () => {
  const { signOut, user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Logout realizado",
        description: "Você foi deslogado com sucesso.",
      });
      navigate('/login');
    } catch (error) {
      toast({
        title: "Erro ao deslogar",
        description: "Ocorreu um erro ao tentar deslogar.",
        variant: "destructive",
      });
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="font-bold text-xl text-green-600">NutriFlow</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/dashboard" 
              className={`text-gray-700 hover:text-green-600 px-3 py-2 rounded-md transition-colors ${
                location.pathname === '/dashboard' ? 'text-green-600 font-medium' : ''
              }`}
            >
              Dashboard
            </Link>
            <Link 
              to="/patients" 
              className={`text-gray-700 hover:text-green-600 px-3 py-2 rounded-md transition-colors ${
                location.pathname === '/patients' ? 'text-green-600 font-medium' : ''
              }`}
            >
              Pacientes
            </Link>
            <Link 
              to="/calculator" 
              className={`text-gray-700 hover:text-green-600 px-3 py-2 rounded-md transition-colors ${
                location.pathname === '/calculator' ? 'text-green-600 font-medium' : ''
              }`}
            >
              Calculadora
            </Link>
            <Link 
              to="/meal-plan-generator" 
              className={`text-gray-700 hover:text-green-600 px-3 py-2 rounded-md transition-colors ${
                location.pathname === '/meal-plan-generator' ? 'text-green-600 font-medium' : ''
              }`}
            >
              Plano Alimentar
            </Link>
            <Link 
              to="/advanced-features" 
              className={`text-gray-700 hover:text-green-600 px-3 py-2 rounded-md transition-colors ${
                location.pathname === '/advanced-features' ? 'text-green-600 font-medium' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Avançado
              </div>
            </Link>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  className="flex items-center space-x-2 text-sm text-gray-700 hover:text-green-600"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  <User className="h-5 w-5" />
                  <span>{user.email}</span>
                </button>
              </div>
            ) : (
              <Link to="/login" className="text-gray-700 hover:text-green-600">
                Login
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-gray-700 focus:outline-none"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              <Link
                to="/dashboard"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  location.pathname === '/dashboard'
                    ? 'text-green-600 bg-green-50'
                    : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                to="/patients"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  location.pathname === '/patients'
                    ? 'text-green-600 bg-green-50'
                    : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pacientes
              </Link>
              <Link
                to="/calculator"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  location.pathname === '/calculator'
                    ? 'text-green-600 bg-green-50'
                    : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Calculadora
              </Link>
              <Link
                to="/meal-plan-generator"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  location.pathname === '/meal-plan-generator'
                    ? 'text-green-600 bg-green-50'
                    : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Plano Alimentar
              </Link>
              <Link
                to="/advanced-features"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  location.pathname === '/advanced-features'
                    ? 'text-green-600 bg-green-50'
                    : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Funcionalidades Avançadas
                </div>
              </Link>
              <button
                onClick={handleSignOut}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50 transition-colors w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  Sair
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
