
import React from 'react';
import { Home, ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useActivePatient } from '@/hooks/useActivePatient';

const BreadcrumbNav = () => {
  const location = useLocation();
  const { patient: activePatient } = useActivePatient();
  
  // Determine current page
  let currentPage = 'Plano Alimentar';
  let pathSegments = [
    { name: 'Início', path: '/', icon: <Home className="h-4 w-4" /> },
    { name: 'Pacientes', path: '/patients' }
  ];
  
  if (location.pathname.includes('meal-plan-generator')) {
    currentPage = 'Plano Alimentar';
    pathSegments = [
      ...pathSegments,
      { name: 'Consulta', path: '/consultation' },
      { name: currentPage, path: '/meal-plan-generator' }
    ];
  } else if (location.pathname.includes('patient-history')) {
    currentPage = activePatient?.name || 'Paciente';
    pathSegments = [
      ...pathSegments,
      { name: currentPage, path: `/patient-history/${activePatient?.id}` }
    ];
  }
  
  return (
    <nav className="flex items-center text-sm text-gray-500 mb-4">
      {pathSegments.map((segment, index) => (
        <React.Fragment key={index}>
          <Link 
            to={segment.path} 
            className="flex items-center hover:text-nutri-blue transition-colors"
          >
            {segment.icon && <span className="mr-1">{segment.icon}</span>}
            {segment.name}
          </Link>
          
          {index < pathSegments.length - 1 && (
            <ChevronRight className="h-3 w-3 mx-2 text-gray-400" />
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default BreadcrumbNav;
