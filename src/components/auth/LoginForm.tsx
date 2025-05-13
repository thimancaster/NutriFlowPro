
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Loader2, ArrowRight, Apple, Lock, Mail } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { AUTH_STORAGE_KEYS } from '@/constants/authConstants';
import { storageUtils } from '@/utils/storageUtils';

interface LoginFormProps {
  onGoogleLogin: () => void;
}

const LoginForm = ({ onGoogleLogin }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(() => {
    // Initialize from localStorage if available
    return !!storageUtils.getLocalItem<boolean>(AUTH_STORAGE_KEYS.REMEMBER_ME);
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha seu email e senha.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);

    try {
      console.log("Tentando fazer login com:", { email, rememberMe });
      const { success, error } = await login(email, password, rememberMe);
      
      if (!success && error) {
        console.error("Erro no login:", error);
        throw error;
      } else {
        console.log("Login bem-sucedido");
        
        // Store remember me preference
        storageUtils.setLocalItem(AUTH_STORAGE_KEYS.REMEMBER_ME, rememberMe);
        
        // After successful login, navigate to dashboard
        navigate('/dashboard', { replace: true });
      }
    } catch (error: any) {
      console.error("Erro no login:", error);
      // Toast is already handled in the login function
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      console.log("Iniciando login com Google...");
      await onGoogleLogin();
      // Navigation happens in parent component
      
      // Store remember me preference for Google login too
      storageUtils.setLocalItem(AUTH_STORAGE_KEYS.REMEMBER_ME, rememberMe);
    } catch (error: any) {
      console.error("Erro ao processar login com Google:", error);
      toast({
        title: "Erro ao fazer login com Google",
        description: error.message || "Não foi possível conectar com o Google. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="px-6 py-8 sm:px-8">
      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-blue-100 mb-1 flex items-center">
            <Mail className="h-4 w-4 mr-1.5 text-blue-200" />
            E-mail
          </label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/20 border-0 text-white placeholder:text-blue-200 focus-visible:ring-white pl-3 transition-all duration-200 hover:bg-white/30"
              placeholder="seu@email.com"
              required
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <label htmlFor="password" className="block text-sm font-medium text-blue-100 flex items-center">
              <Lock className="h-4 w-4 mr-1.5 text-blue-200" />
              Senha
            </label>
            <Link to="/forgot-password" className="text-sm text-blue-200 hover:text-white transition-colors">
              Esqueci minha senha
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-white/20 border-0 text-white placeholder:text-blue-200 focus-visible:ring-white pl-3 transition-all duration-200 hover:bg-white/30"
            placeholder="••••••••"
            required
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="rememberMe" 
            checked={rememberMe} 
            onCheckedChange={(checked) => setRememberMe(!!checked)}
            className="data-[state=checked]:bg-white data-[state=checked]:text-nutri-blue" 
          />
          <label
            htmlFor="rememberMe"
            className="text-sm font-medium leading-none text-blue-100 cursor-pointer"
          >
            Lembrar-me
          </label>
        </div>

        <Button
          type="submit"
          className="w-full bg-white text-nutri-blue hover:bg-blue-100 font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Entrando...
            </>
          ) : (
            <>
              Entrar
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <div className="mt-6 mb-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-blue-200/30"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-nutri-blue/0 backdrop-blur-sm px-2 text-blue-200">ou continue com</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button 
          variant="outline" 
          className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white hover:text-nutri-blue transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading}
        >
          {isGoogleLoading ? (
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          ) : (
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          )}
          Google
        </Button>
        <Button 
          variant="outline" 
          className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white hover:text-nutri-blue transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          onClick={() => toast({
            title: "Login com Apple",
            description: "Esta funcionalidade está disponível apenas para iOS.",
          })}
        >
          <Apple className="h-5 w-5 mr-2" />
          Apple
        </Button>
      </div>

      <div className="mt-8 text-center">
        <p className="text-blue-100">
          Não tem uma conta?{" "}
          <Link to="/register" className="text-white hover:underline font-medium transition-colors">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
