
import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Calculator, ChevronRight } from 'lucide-react';

const BreadcrumbNav = () => {
  return (
    <div className="flex items-center mb-4 text-sm text-gray-600">
      <Link to="/" className="flex items-center hover:text-nutri-blue transition-colors">
        <Home className="h-4 w-4 mr-1" />
        <span>Início</span>
      </Link>
      <ChevronRight className="h-3 w-3 mx-2" />
      <Link to="/consultation" className="flex items-center hover:text-nutri-blue transition-colors">
        <Calculator className="h-4 w-4 mr-1" />
        <span>Consulta</span>
      </Link>
      <ChevronRight className="h-3 w-3 mx-2" />
      <span className="font-medium text-nutri-blue">Plano Alimentar</span>
    </div>
  );
};

export default BreadcrumbNav;
