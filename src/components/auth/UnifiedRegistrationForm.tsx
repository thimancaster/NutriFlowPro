
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';
import { validatePasswordStrength, sanitizeInput } from '@/utils/securityUtils';

const step1Schema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos').optional(),
  crn: z.string().min(4, 'CRN deve ter pelo menos 4 caracteres').optional(),
});

const step2Schema = z.object({
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não conferem",
  path: ["confirmPassword"],
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;

interface UnifiedRegistrationFormProps {
  onSuccess?: () => void;
  onBackToLogin?: () => void;
}

const UnifiedRegistrationForm: React.FC<UnifiedRegistrationFormProps> = ({
  onSuccess,
  onBackToLogin
}) => {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null);
  
  const { signup } = useAuth();
  const { toast } = useToast();

  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      crn: '',
    },
  });

  const step2Form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const handleStep1Submit = (data: Step1Data) => {
    const sanitizedData = {
      name: sanitizeInput(data.name),
      email: sanitizeInput(data.email),
      phone: data.phone ? sanitizeInput(data.phone) : undefined,
      crn: data.crn ? sanitizeInput(data.crn) : undefined,
    };
    
    setStep1Data(sanitizedData);
    setStep(2);
  };

  const handleStep2Submit = async (data: Step2Data) => {
    if (!step1Data) return;

    // Validate password strength
    const passwordValidation = validatePasswordStrength(data.password);
    if (!passwordValidation.isValid) {
      toast({
        title: "Senha insegura",
        description: passwordValidation.errors[0],
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await signup(step1Data.email, data.password, step1Data.name);
      
      if (result.success) {
        toast({
          title: "Conta criada com sucesso!",
          description: "Verifique seu email para confirmar sua conta antes de fazer login.",
          duration: 6000,
        });
        onSuccess?.();
      } else {
        throw new Error(result.error?.message || 'Erro ao criar conta');
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

  const goBack = () => {
    if (step === 1) {
      onBackToLogin?.();
    } else {
      setStep(1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center mb-6">
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step >= 1 ? 'bg-white text-nutri-blue' : 'bg-white/30 text-white'
          }`}>
            {step > 1 ? <Check className="h-5 w-5" /> : 1}
          </div>
          <div className={`h-1 w-8 ${step > 1 ? 'bg-white' : 'bg-white/30'}`}></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step >= 2 ? 'bg-white text-nutri-blue' : 'bg-white/30 text-white'
          }`}>
            2
          </div>
        </div>
      </div>

      {step === 1 ? (
        <form onSubmit={step1Form.handleSubmit(handleStep1Submit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-blue-100 mb-1">
              Nome completo *
            </label>
            <Input
              {...step1Form.register('name')}
              className="bg-white/20 border-0 text-white placeholder:text-blue-200 focus-visible:ring-white"
              placeholder="Seu nome completo"
              autoComplete="name"
            />
            {step1Form.formState.errors.name && (
              <p className="text-red-300 text-sm mt-1">
                {step1Form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-100 mb-1">
              E-mail profissional *
            </label>
            <Input
              {...step1Form.register('email')}
              type="email"
              className="bg-white/20 border-0 text-white placeholder:text-blue-200 focus-visible:ring-white"
              placeholder="seu@email.com"
              autoComplete="email"
            />
            {step1Form.formState.errors.email && (
              <p className="text-red-300 text-sm mt-1">
                {step1Form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-100 mb-1">
              Telefone
            </label>
            <Input
              {...step1Form.register('phone')}
              type="tel"
              className="bg-white/20 border-0 text-white placeholder:text-blue-200 focus-visible:ring-white"
              placeholder="(11) 99999-9999"
              autoComplete="tel"
            />
            {step1Form.formState.errors.phone && (
              <p className="text-red-300 text-sm mt-1">
                {step1Form.formState.errors.phone.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-100 mb-1">
              CRN (Conselho Regional de Nutricionistas)
            </label>
            <Input
              {...step1Form.register('crn')}
              className="bg-white/20 border-0 text-white placeholder:text-blue-200 focus-visible:ring-white"
              placeholder="Ex: CRN-1 12345"
            />
            {step1Form.formState.errors.crn && (
              <p className="text-red-300 text-sm mt-1">
                {step1Form.formState.errors.crn.message}
              </p>
            )}
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={goBack}
              className="flex-1 bg-transparent border-white text-white hover:bg-white/20"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-white text-nutri-blue hover:bg-blue-100 font-medium"
            >
              Continuar
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={step2Form.handleSubmit(handleStep2Submit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-blue-100 mb-1">
              Senha *
            </label>
            <div className="relative">
              <Input
                {...step2Form.register('password')}
                type={showPassword ? 'text' : 'password'}
                className="bg-white/20 border-0 text-white placeholder:text-blue-200 focus-visible:ring-white pr-10"
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-200 hover:text-white"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {step2Form.formState.errors.password && (
              <p className="text-red-300 text-sm mt-1">
                {step2Form.formState.errors.password.message}
              </p>
            )}
          </div>

          <PasswordStrengthMeter 
            password={step2Form.watch('password')} 
            className="bg-white/10 p-3 rounded-lg"
          />

          <div>
            <label className="block text-sm font-medium text-blue-100 mb-1">
              Confirmar senha *
            </label>
            <div className="relative">
              <Input
                {...step2Form.register('confirmPassword')}
                type={showConfirmPassword ? 'text' : 'password'}
                className="bg-white/20 border-0 text-white placeholder:text-blue-200 focus-visible:ring-white pr-10"
                placeholder="Digite a senha novamente"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-200 hover:text-white"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {step2Form.formState.errors.confirmPassword && (
              <p className="text-red-300 text-sm mt-1">
                {step2Form.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div className="bg-blue-100/10 p-4 rounded-lg">
            <p className="text-blue-100 text-sm">
              ⚠️ <strong>Verificação de email obrigatória:</strong> Após criar sua conta, 
              você receberá um email de confirmação. É necessário verificar seu email 
              antes de poder fazer login.
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={goBack}
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
        </form>
      )}
    </div>
  );
};

export default UnifiedRegistrationForm;
