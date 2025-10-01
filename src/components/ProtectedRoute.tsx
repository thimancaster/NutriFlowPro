import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/AuthContext';
import AuthLoadingScreen from './auth/AuthLoadingScreen';

/**
 * Componente de Rota Protegida.
 * Garante que apenas usuários autenticados possam acessar as rotas filhas.
 * Agora, ele aguarda a verificação inicial de sessão antes de tomar uma decisão.
 */
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, initialLoad } = useAuth(); // <-- OBTÉM O NOVO ESTADO initialLoad

  // Se a verificação inicial ainda não terminou, exibe uma tela de carregamento.
  // Esta é a correção principal para o loop de redirecionamento.
  if (initialLoad) {
    return <AuthLoadingScreen message="Verificando sua sessão..." />;
  }

  // Se a verificação terminou e não há usuário, redireciona para o login.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Se a verificação terminou e há um usuário, permite o acesso.
  return children;
};

export default ProtectedRoute;
