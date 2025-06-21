
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  name: string;
  path: string;
  icon?: React.ComponentType<{ className?: string }>;
}

const BreadcrumbNav: React.FC = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  const breadcrumbItems: BreadcrumbItem[] = [
    { name: 'Início', path: '/dashboard', icon: Home },
    ...pathSegments.map((segment, index) => ({
      name: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
      path: '/' + pathSegments.slice(0, index + 1).join('/'),
    }))
  ];

  if (pathSegments.length === 0 || location.pathname === '/dashboard') {
    return null;
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6 animate-fade-in">
      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={item.path}>
          {index > 0 && (
            <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
          )}
          <Link
            to={item.path}
            className={cn(
              "flex items-center gap-1 transition-colors duration-200 hover:text-foreground",
              index === breadcrumbItems.length - 1 
                ? "text-foreground font-medium" 
                : "hover:underline"
            )}
          >
            {index === 0 && item.icon && (
              <item.icon className="h-4 w-4" />
            )}
            <span>{item.name}</span>
          </Link>
        </React.Fragment>
      ))}
    </nav>
  );
};

export { BreadcrumbNav };
