
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Check, Loader2 } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const { signup } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const validateStep1 = () => {
    if (!name || name.length < 3) {
      toast({
        title: "Nome inválido",
        description: "Por favor, insira seu nome completo",
        variant: "destructive",
      });
      return false;
    }
    
    if (!email || !email.includes('@') || !email.includes('.')) {
      toast({
        title: "Email inválido",
        description: "Por favor, insira um email válido",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  const validateStep2 = () => {
    if (!password || password.length < 6) {
      toast({
        title: "Senha inválida",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive",
      });
      return false;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "Senhas não conferem",
        description: "A confirmação de senha deve ser idêntica à senha",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep2()) return;
    
    setIsLoading(true);
    
    try {
      const result = await signup(email, password, name);
      
      if (result.success) {
        toast({
          title: "Conta criada com sucesso",
          description: "Bem-vindo ao NutriFlow Pro!",
        });
        navigate('/');
      } else {
        throw new Error(result.error?.message);
      }
    } catch (error: any) {
      toast({
        title: "Erro ao criar conta",
        description: error.message || "Ocorreu um erro ao criar sua conta",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-nutri-blue flex flex-col items-center justify-center p-4 sm:p-6">
      <Helmet>
        <title>Criar Conta - NutriFlow Pro</title>
      </Helmet>
      
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">NutriFlow Pro</h1>
          <p className="text-blue-100 text-lg">Sistema completo para nutricionistas</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-xl p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-white">Criar Conta</h2>
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 1 ? 'bg-white text-nutri-blue' : 'bg-white/30 text-white'
              }`}>
                {step > 1 ? <Check className="h-5 w-5" /> : 1}
              </div>
              <div className={`h-1 w-5 ${step > 1 ? 'bg-white' : 'bg-white/30'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 2 ? 'bg-white text-nutri-blue' : 'bg-white/30 text-white'
              }`}>
                2
              </div>
            </div>
          </div>
          
          <form onSubmit={handleRegister} className="space-y-4">
            {step === 1 ? (
              <>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-blue-100 mb-1">
                    Nome completo
                  </label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-white/20 border-0 text-white placeholder:text-blue-200 focus-visible:ring-white"
                    placeholder="Seu nome completo"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-blue-100 mb-1">
                    E-mail profissional
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
                  type="button"
                  onClick={handleNextStep}
                  className="w-full bg-white text-nutri-blue hover:bg-blue-100 font-medium mt-2"
                >
                  Continuar
                </Button>
              </>
            ) : (
              <>
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
                    placeholder="Mínimo 6 caracteres"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-blue-100 mb-1">
                    Confirmar senha
                  </label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-white/20 border-0 text-white placeholder:text-blue-200 focus-visible:ring-white"
                    placeholder="Digite a senha novamente"
                    required
                  />
                </div>

                <div className="flex space-x-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1 bg-transparent border-white text-white hover:bg-white/20"
                  >
                    Voltar
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-white text-nutri-blue hover:bg-blue-100 font-medium"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      "Criar conta"
                    )}
                  </Button>
                </div>
              </>
            )}
          </form>

          <div className="mt-6 text-center">
            <p className="text-blue-100">
              Já tem uma conta?{" "}
              <Link to="/login" className="text-white hover:underline font-medium">
                Faça login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
