
import React from 'react';
import { Link } from 'react-router-dom';
import { Apple } from 'lucide-react';

const NavbarBrand = () => {
  return (
    <Link to="/" className="flex-shrink-0 flex items-center">
      <Apple className="h-8 w-8 text-nutri-green mr-2" />
      <span className="text-nutri-green font-bold text-xl">Nutri</span>
      <span className="text-nutri-blue font-bold text-xl">Flow</span>
    </Link>
  );
};

export default NavbarBrand;
