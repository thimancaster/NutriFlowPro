
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { LockKeyhole, Check, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import AuthLayout from '@/components/auth/AuthLayout';
import AuthHeader from '@/components/auth/AuthHeader';
import { PasswordStrengthMeter } from '@/components/auth/PasswordStrengthMeter';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Verify the reset token on mount
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        toast({
          title: "Link inválido ou expirado",
          description: "Por favor, solicite um novo link de redefinição de senha.",
          variant: "destructive",
        });
        navigate('/forgot-password');
      }
    };

    checkSession();
  }, [toast, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Senhas não conferem",
        description: "As senhas digitadas não são iguais. Por favor, verifique.",
        variant: "destructive",
      });
      return;
    }
    
    if (password.length < 8) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 8 caracteres.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.auth.updateUser({ 
        password 
      });
      
      if (error) throw error;
      
      setIsSuccess(true);
      toast({
        title: "Senha redefinida com sucesso!",
        description: "Sua senha foi alterada. Você será redirecionado para fazer login.",
      });
      
      // Redirect after a delay
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (error: any) {
      toast({
        title: "Erro ao redefinir senha",
        description: error.message || "Ocorreu um erro ao tentar redefinir sua senha.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <AuthHeader
        title="NutriFlow Pro"
        subtitle="Sistema completo para nutricionistas"
      />

      <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-xl p-6 sm:p-8 max-w-md w-full mx-auto">
        {isSuccess ? (
          <div className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-green-100/20 rounded-full flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-white" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-white">Senha Redefinida!</h2>
              <p className="text-blue-100">
                Sua senha foi alterada com sucesso. Redirecionando para a página de login...
              </p>
            </div>
            <Button 
              onClick={() => navigate('/login')}
              className="w-full bg-white text-nutri-blue hover:bg-blue-100"
            >
              Ir para Login
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="mx-auto w-16 h-16 bg-blue-100/20 rounded-full flex items-center justify-center mb-4">
                <LockKeyhole className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-white">Criar Nova Senha</h2>
              <p className="text-blue-100">
                Digite uma nova senha segura para sua conta.
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-blue-100 mb-1">
                  Nova senha
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white/20 border-0 !text-white placeholder:!text-white/60 focus-visible:ring-white focus-visible:ring-2 pr-10 [&:-webkit-autofill]:!bg-white/10 [&:-webkit-autofill]:!text-white [&:-webkit-autofill]:[-webkit-text-fill-color:white]"
                    placeholder="Mínimo 8 caracteres"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-200 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <PasswordStrengthMeter 
                password={password} 
                className="bg-white/10 p-3 rounded-lg"
              />

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-blue-100 mb-1">
                  Confirmar nova senha
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-white/20 border-0 !text-white placeholder:!text-white/60 focus-visible:ring-white focus-visible:ring-2 pr-10 [&:-webkit-autofill]:!bg-white/10 [&:-webkit-autofill]:!text-white [&:-webkit-autofill]:[-webkit-text-fill-color:white]"
                    placeholder="Digite a senha novamente"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-200 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-white text-nutri-blue hover:bg-blue-100 font-medium"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Redefinindo..." : "Redefinir Senha"}
              </Button>
              
              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  className="text-blue-100 hover:text-white"
                  onClick={() => navigate('/login')}
                >
                  Voltar para login
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AuthLayout>
  );
};

export default ResetPassword;
