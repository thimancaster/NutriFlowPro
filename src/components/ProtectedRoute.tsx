
import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
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
import { Home, Star, Crown, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const ProtectedRoute = () => {
  const { isAuthenticated, user, isLoading: authLoading, isPremium: isUserPremium } = useAuthState();
  const { data: subscription, isPremiumUser } = useUserSubscription();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Combinação otimizada das duas verificações para garantir status premium
  const isPremium = React.useMemo(() => {
    return isUserPremium || isPremiumUser;
  }, [isUserPremium, isPremiumUser]);

  // Efeito para verificar autenticação e redirecionar para login se não estiver autenticado
  useEffect(() => {
    if (!authLoading && isAuthenticated === false) {
      // Move toast inside effect to prevent rendering issues
      setTimeout(() => {
        toast({
          title: "Sessão expirada",
          description: "Por favor, faça login novamente.",
          variant: "destructive"
        });
      }, 0);
      
      navigate('/login', { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate, toast]);

  // Mostrar carregamento enquanto verifica autenticação
  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-nutri-blue"></div>
        <p className="ml-3 text-nutri-blue font-medium mt-2">Verificando autenticação...</p>
      </div>
    );
  }

  // Redirecionar para login quando temos certeza que não está autenticado
  if (isAuthenticated === false) {
    // Don't show toast here, it's already handled in the effect
    return <Navigate to="/login" replace />;
  }

  // Se ainda estiver indeterminado (null) ou não estiver autenticado, mostrar carregamento
  if (isAuthenticated !== true) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-nutri-blue"></div>
        <p className="ml-3 text-nutri-blue font-medium mt-2">Verificando sessão...</p>
        <button 
          onClick={() => navigate('/login')} 
          className="mt-4 px-4 py-2 bg-nutri-blue text-white rounded hover:bg-nutri-blue-dark"
        >
          Ir para login
        </button>
      </div>
    );
  }

  // Gerar breadcrumbs baseado no caminho atual
  const generateBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(x => x);
    
    // Mapear caminhos para nomes mais legíveis
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
      'add-testimonial': 'Adicionar Depoimento',
      'subscription': 'Assinatura'
    };
    
    // Não mostrar breadcrumbs na página inicial
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
            // Pular partes numéricas (geralmente ids)
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
          
          {/* Premium Badge */}
          {isPremium && (
            <div className="ml-auto">
              <Badge 
                variant="outline" 
                className="bg-gradient-to-r from-amber-100 to-yellow-200 text-yellow-800 border-yellow-300 flex items-center gap-1 shadow-sm animate-pulse"
              >
                <Sparkles className="h-3 w-3 mr-1 text-amber-500 fill-yellow-400" />
                Premium
              </Badge>
            </div>
          )}
        </BreadcrumbList>
      </Breadcrumb>
    );
  };

  return (
    <div className={`min-h-screen ${isPremium ? 'bg-gradient-to-b from-amber-50 to-gray-50' : 'bg-gray-50'}`}>
      {isPremium && (
        <div className="h-1 bg-gradient-to-r from-amber-300 to-yellow-400"></div>
      )}
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {generateBreadcrumbs()}
        <Outlet />
      </div>
    </div>
  );
};

export default ProtectedRoute;
