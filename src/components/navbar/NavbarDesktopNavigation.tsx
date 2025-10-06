import React, { memo, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LucideIcon, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NavigationItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

interface NavbarDesktopNavigationProps {
  navigationItems: NavigationItem[];
}

const NavbarDesktopNavigation: React.FC<NavbarDesktopNavigationProps> = memo(
  ({ navigationItems }) => {
    const location = useLocation();

    // Organiza os itens de navegação em grupos: primários e clínicos
    const { primaryItems, clinicalItems } = useMemo(() => {
      const primary = ['Dashboard', 'Pacientes', 'Agendamentos', 'Calculadora'];
      return {
        primaryItems: navigationItems.filter((item) =>
          primary.includes(item.name)
        ),
        clinicalItems: navigationItems.filter(
          (item) => !primary.includes(item.name)
        ),
      };
    }, [navigationItems]);

    // Função para renderizar um item de navegação, seja no menu principal ou no dropdown
    const renderNavigationItem = (item: NavigationItem, isInDropdown = false) => {
      const Icon = item.icon;
      const isActive = location.pathname.startsWith(item.href);

      if (isInDropdown) {
        return (
          <DropdownMenuItem key={item.name} asChild>
            <Link
              to={item.href}
              className={`flex items-center px-2 py-2 text-sm w-full ${
                isActive ? 'bg-accent text-accent-foreground' : ''
              }`}
            >
              <Icon className="h-4 w-4 mr-2" />
              {item.name}
            </Link>
          </DropdownMenuItem>
        );
      }

      return (
        <Link
          key={item.name}
          to={item.href}
          className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
            isActive
              ? 'bg-primary text-primary-foreground'
              : 'text-foreground hover:bg-accent hover:text-accent-foreground'
          }`}
        >
          <Icon className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>{item.name}</span>
        </Link>
      );
    };

    // Verifica se algum item no dropdown está ativo para destacar o botão "Clínico"
    const isClinicalActive = clinicalItems.some((item) =>
      location.pathname.startsWith(item.href)
    );

    return (
      <div className="hidden md:ml-2 lg:ml-4 md:flex items-center md:space-x-1 lg:space-x-3 xl:space-x-4">
        {primaryItems.map((item) => renderNavigationItem(item))}

        {clinicalItems.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isClinicalActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <span>Clínico</span>
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {clinicalItems.map((item) => renderNavigationItem(item, true))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    );
  }
);

NavbarDesktopNavigation.displayName = 'NavbarDesktopNavigation';

export default NavbarDesktopNavigation;
