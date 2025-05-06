import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth/AuthContext';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAuthenticated, signup } = useAuth();

  // Redirect to home if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Password validation
    if (password !== confirmPassword) {
      toast({
        title: "Senhas não conferem",
        description: "As senhas digitadas não correspondem. Por favor, tente novamente.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const { success, error } = await signup(email, password, name);
      
      if (!success && error) {
        throw error;
      }
      
      // Navigate is handled automatically by useEffect when auth state changes
    } catch (error: any) {
      console.error("Signup error:", error);
      // Toast is already handled in the signup function
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-nutri-blue flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">NutriFlow Pro</h1>
          <p className="text-blue-100 text-lg">Sistema completo para nutricionistas</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-xl p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <Link to="/login" className="text-sm text-blue-200 hover:text-white flex items-center">
              <ArrowLeft className="h-4 w-4 mr-1" /> Voltar para login
            </Link>
            <h2 className="text-2xl font-semibold text-white">Criar Conta</h2>
          </div>
          
          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-blue-100 mb-1">
                Nome Completo
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-white/20 border-0 text-white placeholder:text-blue-200 focus-visible:ring-white"
                placeholder="Seu nome"
                required
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-blue-100 mb-1">
                E-mail
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/20 border-0 text-white placeholder:text-blue-200 focus-visible:ring-white"
                placeholder="seu@email.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-blue-100 mb-1">
                Senha
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/20 border-0 text-white placeholder:text-blue-200 focus-visible:ring-white"
                placeholder="••••••••"
                required
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-blue-100 mb-1">
                Confirme a Senha
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-white/20 border-0 text-white placeholder:text-blue-200 focus-visible:ring-white"
                placeholder="••••••••"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-white text-nutri-blue hover:bg-blue-100 font-medium"
              disabled={isLoading}
            >
              {isLoading ? "Criando..." : "Criar Conta"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
          
          <div className="mt-6 text-center text-blue-100 text-sm">
            Ao criar uma conta, você concorda com os nossos{" "}
            <a href="#" className="text-white hover:underline">
              Termos de Serviço
            </a>{" "}
            e{" "}
            <a href="#" className="text-white hover:underline">
              Política de Privacidade
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
