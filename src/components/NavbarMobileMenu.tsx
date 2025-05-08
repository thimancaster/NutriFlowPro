
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut } from 'lucide-react';
import { NavigationItem } from './NavbarDesktopMenu';

export interface NavbarMobileMenuProps {
  isOpen: boolean;
  navigationItems: NavigationItem[];
  onClose: () => void;
  onLogout: () => Promise<void>;
}

const NavbarMobileMenu = ({
  isOpen,
  navigationItems,
  onClose,
  onLogout
}: NavbarMobileMenuProps) => {
  const { user } = useAuth();

  if (!isOpen) return null;

  return (
    <div className="md:hidden">
      <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
        {navigationItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-nutri-blue"
            onClick={onClose}
          >
            <span className="mr-2">{item.icon}</span>
            {item.name}
          </Link>
        ))}
      </div>

      <div className="pt-4 pb-3 border-t border-gray-200">
        <div className="flex items-center px-5">
          <div className="flex-shrink-0">
            <Avatar className="h-10 w-10 bg-nutri-blue text-white">
              <AvatarFallback>
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="ml-3">
            <div className="text-base font-medium text-gray-800">
              {user?.email || "User"}
            </div>
            <div className="text-sm font-medium text-gray-500">
              {user?.email || ""}
            </div>
          </div>
        </div>
        <div className="mt-3 px-2 space-y-1">
          <Button
            variant="ghost"
            className="flex w-full justify-start"
            onClick={async () => {
              await onLogout();
              onClose();
            }}
          >
            <LogOut className="h-5 w-5 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NavbarMobileMenu;
