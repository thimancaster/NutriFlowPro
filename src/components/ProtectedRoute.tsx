
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthState } from '@/hooks/useAuthState';
import { useUserSubscription } from '@/hooks/useUserSubscription';
import Navbar from './Navbar';
import { 
  Breadcrumb, 
  BreadcrumbList, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb";
import { Home } from 'lucide-react';

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuthState();
  const { data: subscription } = useUserSubscription();
  const location = useLocation();

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-nutri-blue"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (isAuthenticated === false) {
    return <Navigate to="/login" replace />;
  }

  // Generate breadcrumbs based on the current path
  const generateBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(x => x);
    
    // Map paths to more readable names
    const pathMap: {[key: string]: string} = {
      'calculator': 'Calculadora',
      'patients': 'Pacientes',
      'meal-plans': 'Planos Alimentares',
      'recursos': 'Recursos',
      'consultation': 'Consulta',
      'meal-plan-generator': 'Gerador de Planos',
      'patient-history': 'Histórico',
      'patient-anthropometry': 'Antropometria',
      'settings': 'Configurações',
      'add-testimonial': 'Adicionar Depoimento'
    };
    
    // Don't show breadcrumbs on home page
    if (paths.length === 0) return null;
    
    return (
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">
              <Home className="h-4 w-4 mr-1" />
              <span>Início</span>
            </BreadcrumbLink>
          </BreadcrumbItem>
          
          {paths.map((path, index) => {
            // Skip numeric parts (usually ids)
            if (!isNaN(Number(path))) return null;
            
            const displayPath = pathMap[path] || path;
            const isLast = index === paths.length - 1;
            
            return (
              <React.Fragment key={path}>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage>{displayPath}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={`/${paths.slice(0, index + 1).join('/')}`}>
                      {displayPath}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    );
  };

  // Show the protected content if authenticated
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {generateBreadcrumbs()}
        <Outlet />
      </div>
    </div>
  );
};

export default ProtectedRoute;
