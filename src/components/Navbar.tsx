
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Apple, Calculator, Users, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <Apple className="h-8 w-8 text-nutri-green mr-2" />
              <span className="text-nutri-green font-bold text-xl">Nutri</span>
              <span className="text-nutri-blue font-bold text-xl">Flow Pro</span>
            </Link>
          </div>
          
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
            <Button variant="default" className="bg-gradient-to-r from-nutri-green to-nutri-green-dark hover:opacity-90 ml-2">
              Entrar
            </Button>
          </div>
          
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

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg animate-fade-in">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className="flex items-center px-3 py-2 rounded-md text-base font-medium text-nutri-gray-dark hover:bg-nutri-gray-light hover:text-nutri-green"
              onClick={toggleMenu}
            >
              <FileText className="h-4 w-4 mr-2" />
              Dashboard
            </Link>
            <Link
              to="/patients"
              className="flex items-center px-3 py-2 rounded-md text-base font-medium text-nutri-gray-dark hover:bg-nutri-gray-light hover:text-nutri-green"
              onClick={toggleMenu}
            >
              <Users className="h-4 w-4 mr-2" />
              Pacientes
            </Link>
            <Link
              to="/calculator"
              className="flex items-center px-3 py-2 rounded-md text-base font-medium text-nutri-gray-dark hover:bg-nutri-gray-light hover:text-nutri-green"
              onClick={toggleMenu}
            >
              <Calculator className="h-4 w-4 mr-2" />
              Calculadora
            </Link>
            <Link
              to="/meal-plans"
              className="flex items-center px-3 py-2 rounded-md text-base font-medium text-nutri-gray-dark hover:bg-nutri-gray-light hover:text-nutri-green"
              onClick={toggleMenu}
            >
              <FileText className="h-4 w-4 mr-2" />
              Planos Alimentares
            </Link>
            <Button
              variant="default"
              className="w-full mt-4 bg-gradient-to-r from-nutri-green to-nutri-green-dark hover:opacity-90"
            >
              Entrar
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
