
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePatientDetail } from '@/hooks/patient/usePatientDetail';

interface BreadcrumbItem {
  name: string;
  path: string;
  icon?: React.ComponentType<{ className?: string }>;
}

const BreadcrumbNav: React.FC = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  // Check if we're on a patient detail page
  const isPatientPage = pathSegments[0] === 'patients' && pathSegments.length >= 2;
  const patientId = isPatientPage ? pathSegments[1] : undefined;
  
  // Get patient data if on patient page
  const { patient } = usePatientDetail(patientId);

  const breadcrumbItems: BreadcrumbItem[] = [
    { name: 'Início', path: '/dashboard', icon: Home },
    ...pathSegments.map((segment, index) => {
      // If this is the patient ID segment and we have patient data, use patient name
      if (index === 1 && pathSegments[0] === 'patients' && patient) {
        return {
          name: patient.name,
          path: '/' + pathSegments.slice(0, index + 1).join('/'),
        };
      }
      
      // For "patients" text
      if (segment === 'patients') {
        return {
          name: 'Pacientes',
          path: '/' + pathSegments.slice(0, index + 1).join('/'),
        };
      }
      
      // Default: capitalize segment
      return {
        name: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
        path: '/' + pathSegments.slice(0, index + 1).join('/'),
      };
    })
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
