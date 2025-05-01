
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

const ProtectedRoute = () => {
  const { isAuthenticated, user, isLoading: authLoading, isPremium: isUserPremium } = useAuthState();
  const { data: subscription, refetchSubscription } = useUserSubscription();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Verificação adicional para garantir que emails premium sejam reconhecidos
  // Combina as duas verificações para garantir status premium
  const isPremium = React.useMemo(() => {
    const result = isUserPremium || (subscription?.isPremium || false);
    console.log("Status premium em ProtectedRoute:", { 
      final: result, 
      authPremium: isUserPremium, 
      subscriptionPremium: subscription?.isPremium
    });
    return result;
  }, [isUserPremium, subscription?.isPremium]);

  // Debug log para verificar status premium
  useEffect(() => {
    console.log("Email atual:", user?.email);
    console.log("Status premium em ProtectedRoute:", isPremium);
  }, [user?.email, isPremium]);

  // Quando a rota muda, buscar novamente os dados da assinatura
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      console.log("Rota alterada, atualizando dados de assinatura");
      refetchSubscription();
    }
  }, [isAuthenticated, user, refetchSubscription, location.pathname]);
  
  // Efeito para verificar autenticação e redirecionar para login se não estiver autenticado
  useEffect(() => {
    const redirectTimeout = setTimeout(() => {
      // Se não estiver carregando e não estiver autenticado, redirecionar para login
      if (!authLoading && isAuthenticated === false) {
        console.log("Usuário não autenticado, redirecionando para login");
        navigate('/login', { replace: true });
      }
    }, 2000); // Timeout de segurança de 2 segundos

    return () => clearTimeout(redirectTimeout);
  }, [authLoading, isAuthenticated, navigate]);

  // Mostrar carregamento enquanto verifica autenticação (com timeout de segurança)
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-nutri-blue"></div>
        <p className="ml-3 text-nutri-blue font-medium">Verificando autenticação...</p>
      </div>
    );
  }

  // Redirecionar para login APENAS quando temos certeza que não está autenticado
  if (isAuthenticated === false) {
    console.log("Usuário não autenticado, redirecionando para login");
    return <Navigate to="/login" replace />;
  }

  // Se ainda estiver indeterminado (null) ou não estiver autenticado, mostrar carregamento
  if (isAuthenticated !== true) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-nutri-blue"></div>
        <p className="ml-3 text-nutri-blue font-medium">Verificando sessão...</p>
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
