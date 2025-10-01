import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthSession } from '@supabase/supabase-js';

// Define a estrutura do que será compartilhado pelo contexto
interface AuthContextType {
  session: AuthSession | null;
  user: any; // Pode ser tipado de forma mais específica com o perfil do usuário
  isLoading: boolean;
  initialLoad: boolean; // <-- NOVA PROPRIEDADE CRÍTICA
}

// Cria o contexto
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

// Cria o provedor que gerencia e fornece o estado de autenticação
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true); // <-- NOVO ESTADO

  useEffect(() => {
    // Tenta obter a sessão inicial já existente
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
      setInitialLoad(false); // <-- AVISA QUE A PRIMEIRA VERIFICAÇÃO TERMINOU
    };

    getInitialSession();

    // Escuta por mudanças no estado de autenticação (login, logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
      if (initialLoad) {
        setInitialLoad(false); // Garante que o estado seja atualizado no primeiro evento também
      }
    });

    // Limpa o listener quando o componente é desmontado
    return () => {
      subscription?.unsubscribe();
    };
  }, [initialLoad]); // Adicionado initialLoad aqui para garantir a lógica

  const value = {
    session,
    user,
    isLoading,
    initialLoad, // <-- EXPOR O NOVO ESTADO
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook customizado para facilitar o uso do contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
