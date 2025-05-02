
import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAuthenticated, resetPassword } = useAuth();

  // Redirect to home if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!email) {
        toast({
          title: "E-mail inválido",
          description: "Por favor, forneça um e-mail válido.",
          variant: "destructive",
        });
        return;
      }

      const { success } = await resetPassword(email);
      
      if (success) {
        setIsSubmitted(true);
      }
    } catch (error) {
      // Error handling is done in the resetPassword function
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
          <div className="flex items-center mb-6">
            <Link to="/login" className="text-sm text-blue-200 hover:text-white flex items-center">
              <ArrowLeft className="h-4 w-4 mr-1" /> Voltar para login
            </Link>
          </div>
          
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-semibold text-white">Recuperar Senha</h2>
            <p className="mt-2 text-blue-100">
              {!isSubmitted 
                ? "Digite seu e-mail para receber um link de recuperação de senha." 
                : "E-mail enviado com sucesso!"}
            </p>
          </div>
          
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-5">
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

              <Button
                type="submit"
                className="w-full bg-white text-nutri-blue hover:bg-blue-100 font-medium"
                disabled={isLoading}
              >
                {isLoading ? "Enviando..." : "Enviar Link de Recuperação"}
              </Button>
            </form>
          ) : (
            <div className="space-y-5">
              <div className="bg-blue-900/30 text-blue-100 p-4 rounded-lg text-sm">
                <p>Se o e-mail fornecido estiver associado a uma conta, você receberá instruções para redefinir sua senha.</p>
                <p className="mt-2">Verifique também sua pasta de spam se não encontrar o e-mail em sua caixa de entrada.</p>
              </div>
              
              <div className="text-center">
                <Button
                  variant="outline"
                  className="bg-transparent border-white text-white hover:bg-white hover:text-nutri-blue"
                  onClick={() => setIsSubmitted(false)}
                >
                  Tentar com outro e-mail
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
