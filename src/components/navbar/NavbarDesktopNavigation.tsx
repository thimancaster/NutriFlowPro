
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface NavigationItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

interface NavbarDesktopNavigationProps {
  navigationItems: NavigationItem[];
}

const NavbarDesktopNavigation: React.FC<NavbarDesktopNavigationProps> = ({ navigationItems }) => {
  const location = useLocation();

  return (
    <div className="hidden md:ml-6 md:flex md:space-x-8">
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.href || 
          (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
        
        return (
          <Link
            key={item.name}
            to={item.href}
            className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ${
              isActive
                ? 'border-nutri-green text-nutri-green'
                : 'border-transparent text-gray-500 hover:text-nutri-blue hover:border-nutri-blue dark:text-gray-400 dark:hover:text-nutri-blue'
            }`}
          >
            <Icon className="h-4 w-4 mr-2" />
            {item.name}
          </Link>
        );
      })}
    </div>
  );
};

export default NavbarDesktopNavigation;
