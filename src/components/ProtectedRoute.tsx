import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/AuthContext';
import AuthLoadingScreen from './auth/AuthLoadingScreen';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, initialLoad } = useAuth();

  // Se a verificação inicial ainda não terminou, exibe uma tela de carregamento.
  // Esta é a correção que quebra o loop.
  if (initialLoad) {
    return <AuthLoadingScreen message="Verificando sua sessão..." />;
  }

  // Se terminou e não há usuário, redireciona.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Se terminou e há usuário, permite o acesso.
  return children;
};

export default ProtectedRoute;
