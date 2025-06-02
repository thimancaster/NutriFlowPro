
import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth/AuthContext';
import { PasswordStrengthMeter } from '@/components/auth/PasswordStrengthMeter';
import { validatePasswordStrength, sanitizeInput } from '@/utils/securityUtils';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAuthenticated, signup } = useAuth();

  // Redirect to home if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const validateStep1 = () => {
    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = sanitizeInput(email);
    
    if (!sanitizedName || sanitizedName.length < 3) {
      toast({
        title: "Nome inválido",
        description: "Por favor, insira seu nome completo (mínimo 3 caracteres)",
        variant: "destructive",
      });
      return false;
    }
    
    if (!sanitizedEmail || !sanitizedEmail.includes('@') || !sanitizedEmail.includes('.')) {
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
    const passwordValidation = validatePasswordStrength(password);
    
    if (!passwordValidation.isValid) {
      toast({
        title: "Senha insegura",
        description: passwordValidation.errors[0] || "A senha não atende aos requisitos de segurança",
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
      // Sanitize inputs before sending
      const sanitizedName = sanitizeInput(name);
      const sanitizedEmail = sanitizeInput(email);
      
      const result = await signup(sanitizedEmail, password, sanitizedName);
      
      if (result.success) {
        toast({
          title: "Conta criada com sucesso",
          description: "Bem-vindo ao NutriFlow Pro! Verifique seu email para confirmar sua conta.",
        });
        navigate('/login');
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
                {step > 1 ? <ArrowRight className="h-5 w-5" /> : 1}
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
                    autoComplete="name"
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
                    autoComplete="email"
                    required
                  />
                </div>

                <Button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full bg-white text-nutri-blue hover:bg-blue-100 font-medium mt-2"
                >
                  Continuar
                  <ArrowRight className="ml-2 h-4 w-4" />
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
                    placeholder="Mínimo 8 caracteres"
                    autoComplete="new-password"
                    required
                  />
                </div>

                <PasswordStrengthMeter 
                  password={password} 
                  className="bg-white/10 p-3 rounded-lg"
                />

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
                    autoComplete="new-password"
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
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-white text-nutri-blue hover:bg-blue-100 font-medium"
                    disabled={isLoading}
                  >
                    {isLoading ? "Criando..." : "Criar conta"}
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

export default Signup;
