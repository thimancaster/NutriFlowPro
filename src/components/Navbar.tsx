
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-nutri-green font-bold text-xl">Nutri</span>
              <span className="text-nutri-blue font-bold text-xl">Vita</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="px-3 py-2 text-nutri-gray-dark hover:text-nutri-green font-medium">
              Dashboard
            </Link>
            <Link to="/patients" className="px-3 py-2 text-nutri-gray-dark hover:text-nutri-green font-medium">
              Pacientes
            </Link>
            <Link to="/calculator" className="px-3 py-2 text-nutri-gray-dark hover:text-nutri-green font-medium">
              Calculadora
            </Link>
            <Link to="/meal-plans" className="px-3 py-2 text-nutri-gray-dark hover:text-nutri-green font-medium">
              Planos Alimentares
            </Link>
            <Button variant="default" className="bg-nutri-green hover:bg-nutri-green-dark ml-2">
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
              className="block px-3 py-2 rounded-md text-base font-medium text-nutri-gray-dark hover:bg-nutri-gray-light hover:text-nutri-green"
              onClick={toggleMenu}
            >
              Dashboard
            </Link>
            <Link
              to="/patients"
              className="block px-3 py-2 rounded-md text-base font-medium text-nutri-gray-dark hover:bg-nutri-gray-light hover:text-nutri-green"
              onClick={toggleMenu}
            >
              Pacientes
            </Link>
            <Link
              to="/calculator"
              className="block px-3 py-2 rounded-md text-base font-medium text-nutri-gray-dark hover:bg-nutri-gray-light hover:text-nutri-green"
              onClick={toggleMenu}
            >
              Calculadora
            </Link>
            <Link
              to="/meal-plans"
              className="block px-3 py-2 rounded-md text-base font-medium text-nutri-gray-dark hover:bg-nutri-gray-light hover:text-nutri-green"
              onClick={toggleMenu}
            >
              Planos Alimentares
            </Link>
            <Button
              variant="default"
              className="w-full mt-4 bg-nutri-green hover:bg-nutri-green-dark"
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
