import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AuthLoadingScreen from './AuthLoadingScreen';

/**
 * Componente responsável por lidar com o callback de autenticação do Supabase.
 * Ele extrai a sessão da URL e redireciona o usuário para a página principal da aplicação.
 */
export default function AuthHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthChange = async () => {
      // A sessão é estabelecida automaticamente pelo Supabase a partir da URL.
      // Apenas precisamos esperar um momento para que o cliente do Supabase
      // processe o token e, em seguida, redirecionar.

      // Adicionamos um pequeno delay para garantir que o estado de autenticação seja atualizado
      // antes de tentarmos acessar uma rota protegida.
      setTimeout(() => {
        console.log('Sessão processada, redirecionando para /app');
        // Esta é a linha corrigida: redireciona para a rota principal do app.
        navigate('/app', { replace: true });
      }, 100);
    };

    handleAuthChange();
  }, [navigate]);

  return <AuthLoadingScreen message="Autenticando e preparando sua sessão..." />;
}
