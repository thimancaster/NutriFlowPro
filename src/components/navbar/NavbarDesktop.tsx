
import React from 'react';
import { Link } from 'react-router-dom';
import { navigationItems } from '@/constants/navigation';
import NavbarUserMenu from './NavbarUserMenu';
import { useAuth } from '@/contexts/auth/AuthContext';

interface NavbarDesktopProps {
  onLogout: () => Promise<void>;
}

const NavbarDesktop: React.FC<NavbarDesktopProps> = ({ onLogout }) => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="hidden md:flex items-center space-x-8">
      <nav className="flex space-x-8">
        {navigationItems.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
          >
            {item.name}
          </Link>
        ))}
      </nav>
      
      {isAuthenticated && (
        <NavbarUserMenu onLogout={onLogout} />
      )}
    </div>
  );
};

export default NavbarDesktop;
