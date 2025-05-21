
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { usePatient } from '@/contexts/PatientContext';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList } from '@/components/ui/breadcrumb';
import { Home, ChevronRight, User, Calculator, Utensils } from 'lucide-react';

interface ContextualNavigationProps {
  currentModule: 'patients' | 'calculator' | 'meal-plans';
}

const ContextualNavigation: React.FC<ContextualNavigationProps> = ({ currentModule }) => {
  const location = useLocation();
  const { activePatient } = usePatient();

  // Generate breadcrumbs based on current module and active patient
  const getBreadcrumbs = () => {
    const crumbs = [{ label: 'Início', path: '/', icon: <Home className="h-4 w-4" /> }];
    
    if (currentModule === 'patients' || activePatient) {
      crumbs.push({ 
        label: 'Pacientes', 
        path: '/patients',
        icon: <User className="h-4 w-4" />
      });
    }
    
    if (activePatient) {
      crumbs.push({ 
        label: activePatient.name, 
        path: `/patients/${activePatient.id}`,
        icon: <User className="h-4 w-4" />
      });
      
      if (currentModule === 'calculator') {
        crumbs.push({ 
          label: 'Calculadora', 
          path: `/calculator?patientId=${activePatient.id}`,
          icon: <Calculator className="h-4 w-4" />
        });
      } else if (currentModule === 'meal-plans') {
        crumbs.push({ 
          label: 'Plano Alimentar', 
          path: `/meal-plans?patientId=${activePatient.id}`,
          icon: <Utensils className="h-4 w-4" />
        });
      }
    } else {
      if (currentModule === 'calculator') {
        crumbs.push({ 
          label: 'Calculadora', 
          path: '/calculator',
          icon: <Calculator className="h-4 w-4" />
        });
      } else if (currentModule === 'meal-plans') {
        crumbs.push({ 
          label: 'Planos Alimentares', 
          path: '/meal-plans',
          icon: <Utensils className="h-4 w-4" />
        });
      }
    }
    
    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="mb-6">
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((crumb, index) => (
            <BreadcrumbItem key={crumb.path}>
              {index > 0 && <ChevronRight className="h-4 w-4 text-gray-400" />}
              <BreadcrumbLink asChild>
                <Link to={crumb.path} className="flex items-center">
                  {crumb.icon && <span className="mr-1">{crumb.icon}</span>}
                  {crumb.label}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      
      {activePatient && (
        <div className="flex gap-4 mt-3 border-b pb-2">
          <Link 
            to={`/patients/${activePatient.id}`}
            className={`text-sm font-medium ${currentModule === 'patients' ? 'text-nutri-blue' : 'text-gray-600 hover:text-nutri-blue'}`}
          >
            Perfil
          </Link>
          <Link 
            to={`/calculator?patientId=${activePatient.id}`}
            className={`text-sm font-medium ${currentModule === 'calculator' ? 'text-nutri-blue' : 'text-gray-600 hover:text-nutri-blue'}`}
          >
            Calculadora
          </Link>
          <Link 
            to={`/meal-plans?patientId=${activePatient.id}`}
            className={`text-sm font-medium ${currentModule === 'meal-plans' ? 'text-nutri-blue' : 'text-gray-600 hover:text-nutri-blue'}`}
          >
            Plano Alimentar
          </Link>
        </div>
      )}
    </div>
  );
};

export default ContextualNavigation;
