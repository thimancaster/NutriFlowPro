
import React, { useEffect } from 'react';
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
import { Home, Star, Crown, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Lista de emails premium
const PREMIUM_EMAILS = ['thimancaster@hotmail.com', 'thiago@nutriflowpro.com'];

const ProtectedRoute = () => {
  const { isAuthenticated, user, isLoading: authLoading } = useAuthState();
  const { data: subscription, refetchSubscription } = useUserSubscription();
  const location = useLocation();
  
  // Verificação adicional para garantir que emails premium sejam reconhecidos
  const isPremium = React.useMemo(() => {
    if (!user?.email) return subscription?.isPremium || false;
    
    // Verificar se o email está na lista de premium, independente do que diz a assinatura
    const isEmailPremium = PREMIUM_EMAILS.includes(user.email);
    return isEmailPremium || (subscription?.isPremium || false);
  }, [user?.email, subscription?.isPremium]);

  // Quando a rota muda, buscar novamente os dados da assinatura
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      console.log("Rota alterada, atualizando dados de assinatura");
      refetchSubscription();
    }
  }, [isAuthenticated, user, refetchSubscription, location.pathname]);

  // Debug para verificar o status de autenticação
  useEffect(() => {
    console.log("Estado de autenticação:", { isAuthenticated, user, authLoading });
    console.log("Status premium:", isPremium);
  }, [isAuthenticated, user, authLoading, isPremium]);

  // Mostrar carregamento enquanto verifica autenticação
  if (authLoading || isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-nutri-blue"></div>
      </div>
    );
  }

  // Redirecionar para login se não estiver autenticado
  if (isAuthenticated === false) {
    console.log("Usuário não autenticado, redirecionando para login");
    return <Navigate to="/login" replace />;
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
