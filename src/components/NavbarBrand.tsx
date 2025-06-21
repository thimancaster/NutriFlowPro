
import React from 'react';
import { Link } from 'react-router-dom';
import { Apple } from 'lucide-react';

const NavbarBrand = () => {
  return (
    <Link to="/" className="flex-shrink-0 flex items-center group">
      <Apple className="h-8 w-8 text-nutri-green dark:text-nutri-green mr-2 transition-colors duration-200 group-hover:text-nutri-green/80" />
      <span className="text-nutri-green dark:text-nutri-green font-bold text-xl transition-colors duration-200 group-hover:text-nutri-green/80">Nutri</span>
      <span className="text-nutri-blue dark:text-nutri-blue font-bold text-xl transition-colors duration-200 group-hover:text-nutri-blue/80">Flow</span>
      <span className="text-muted-foreground ml-1 text-sm">Pro</span>
    </Link>
  );
};

export default NavbarBrand;
