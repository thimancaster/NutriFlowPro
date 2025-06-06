
import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-nutri-blue via-nutri-blue-dark to-blue-900 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-96 h-96 bg-white opacity-5 rounded-full mix-blend-overlay transform -translate-y-1/2 -translate-x-1/2"></div>
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-nutri-green opacity-10 rounded-full mix-blend-overlay transform translate-y-1/2 translate-x-1/2"></div>
      </div>

      <div className="w-full max-w-lg relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-3">NutriFlow Pro</h1>
          <p className="text-blue-100 text-xl font-medium">Sistema completo para nutricionistas</p>
        </div>

        {/* Form Container */}
        <div className="backdrop-blur-md bg-white/15 rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="p-8">
            {/* Progress Indicator */}
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-white">Criar Conta</h2>
              <div className="flex items-center space-x-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                  step >= 1 ? 'bg-white text-nutri-blue shadow-lg' : 'bg-white/20 text-white/60'
                }`}>
                  {step > 1 ? <CheckCircle className="h-6 w-6" /> : '1'}
                </div>
                <div className={`h-1 w-8 rounded transition-all ${step > 1 ? 'bg-white' : 'bg-white/30'}`}></div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                  step >= 2 ? 'bg-white text-nutri-blue shadow-lg' : 'bg-white/20 text-white/60'
                }`}>
                  2
                </div>
              </div>
            </div>
            
            <form onSubmit={handleRegister} className="space-y-6">
              {step === 1 ? (
                <>
                  <div>
                    <label htmlFor="name" className="block text-lg font-semibold text-white mb-2">
                      Nome completo
                    </label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-14 text-lg bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white focus:ring-white/50 font-medium"
                      placeholder="Digite seu nome completo"
                      autoComplete="name"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-lg font-semibold text-white mb-2">
                      E-mail profissional
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-14 text-lg bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white focus:ring-white/50 font-medium"
                      placeholder="seu@email.com"
                      autoComplete="email"
                      required
                    />
                  </div>

                  <Button
                    type="button"
                    onClick={handleNextStep}
                    className="w-full h-14 text-lg font-bold bg-white text-nutri-blue hover:bg-white/90 shadow-lg transition-all duration-200 hover:scale-[1.02] mt-8"
                  >
                    Continuar
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </>
              ) : (
                <>
                  <div>
                    <label htmlFor="password" className="block text-lg font-semibold text-white mb-2">
                      Senha
                    </label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-14 text-lg bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white focus:ring-white/50 font-medium"
                      placeholder="Mínimo 8 caracteres"
                      autoComplete="new-password"
                      required
                    />
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                    <PasswordStrengthMeter password={password} />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-lg font-semibold text-white mb-2">
                      Confirmar senha
                    </label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="h-14 text-lg bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white focus:ring-white/50 font-medium"
                      placeholder="Digite a senha novamente"
                      autoComplete="new-password"
                      required
                    />
                  </div>

                  {/* Warning about email verification */}
                  <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-yellow-900 font-bold text-sm">!</span>
                      </div>
                      <div>
                        <p className="text-yellow-100 font-semibold text-base leading-relaxed">
                          <strong>Verificação de email obrigatória:</strong> Após criar sua conta, você receberá um email de confirmação. É necessário verificar seu email antes de poder fazer login.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="flex-1 h-14 text-lg font-semibold bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/50 transition-all duration-200"
                    >
                      <ArrowLeft className="mr-2 h-5 w-5" />
                      Voltar
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 h-14 text-lg font-bold bg-white text-nutri-blue hover:bg-white/90 shadow-lg transition-all duration-200 hover:scale-[1.02]"
                      disabled={isLoading}
                    >
                      {isLoading ? "Criando..." : "Criar conta"}
                    </Button>
                  </div>
                </>
              )}
            </form>

            <div className="mt-8 text-center border-t border-white/20 pt-6">
              <p className="text-lg text-white/90 font-medium">
                Já tem uma conta?{" "}
                <Link to="/login" className="text-white font-bold hover:underline transition-colors">
                  Faça login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
