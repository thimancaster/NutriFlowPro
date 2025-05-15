
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut } from 'lucide-react';

export interface NavigationItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

export interface NavbarDesktopMenuProps {
  navigationItems: NavigationItem[];
  onLogout: () => Promise<void>;
}

const NavbarDesktopMenu = ({ navigationItems, onLogout }: NavbarDesktopMenuProps) => {
  const { user } = useAuth();

  return (
    <div className="hidden md:flex items-center">
      <div className="flex space-x-1">
        {navigationItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-nutri-blue transition-all duration-200 hover:scale-105"
          >
            {item.name}
          </Link>
        ))}
      </div>

      <div className="ml-4 flex items-center">
        <div className="flex items-center">
          <Avatar className="h-8 w-8 border-2 border-white shadow-sm bg-nutri-blue text-white ring-2 ring-nutri-blue/20">
            <AvatarFallback className="bg-gradient-to-r from-nutri-blue-light to-nutri-blue text-white font-bold">
              {user?.email?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onLogout} 
            className="ml-2 hover-scale hover:bg-red-50 hover:text-red-500"
          >
            <LogOut className="h-4 w-4 mr-1" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NavbarDesktopMenu;
