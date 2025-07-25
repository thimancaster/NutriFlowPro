
import React from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { navigationItems } from '@/constants/navigation';
import { useAuth } from '@/contexts/auth/AuthContext';

interface NavbarMobileProps {
  isOpen: boolean;
  onClose: () => void;
}

const NavbarMobile: React.FC<NavbarMobileProps> = ({ isOpen, onClose }) => {
  const { isAuthenticated } = useAuth();

  if (!isOpen) return null;

  return (
    <div className="md:hidden">
      <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
        <div className="flex items-center justify-between">
          <span className="text-white font-bold text-lg">Menu</span>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        {navigationItems.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            onClick={onClose}
            className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
          >
            {item.name}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default NavbarMobile;
