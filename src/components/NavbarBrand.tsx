
import React from 'react';
import { Link } from 'react-router-dom';
import { Apple } from 'lucide-react';

const NavbarBrand = () => {
  return (
    <Link to="/" className="flex-shrink-0 flex items-center">
      <Apple className="h-8 w-8 text-green-500 mr-2" />
      <span className="text-green-500 font-bold text-xl">Nutri</span>
      <span className="text-blue-500 font-bold text-xl">Flow</span>
      <span className="text-blue-500 font-bold text-xl ml-1">Pro</span>
    </Link>
  );
};

export default NavbarBrand;
