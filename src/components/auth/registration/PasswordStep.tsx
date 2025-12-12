
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordStrengthMeter } from '../PasswordStrengthMeter';
import { validatePasswordStrength } from '@/utils/securityUtils';
import { useToast } from '@/hooks/use-toast';

const step2Schema = z.object({
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não conferem",
  path: ["confirmPassword"],
});

export type PasswordData = z.infer<typeof step2Schema>;

interface PasswordStepProps {
  onSubmit: (data: PasswordData) => void;
  onBack: () => void;
  isLoading: boolean;
}

const PasswordStep: React.FC<PasswordStepProps> = ({
  onSubmit,
  onBack,
  isLoading
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();

  const form = useForm<PasswordData>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const handleSubmit = (data: PasswordData) => {
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

    onSubmit(data);
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-blue-100 mb-1">
          Senha *
        </label>
        <div className="relative">
          <Input
            {...form.register('password')}
            type={showPassword ? 'text' : 'password'}
            className="bg-white/20 border-0 !text-white placeholder:!text-white/60 focus-visible:ring-white pr-10 [&:-webkit-autofill]:!bg-white/10 [&:-webkit-autofill]:!text-white [&:-webkit-autofill]:[-webkit-text-fill-color:white]"
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
        {form.formState.errors.password && (
          <p className="text-red-300 text-sm mt-1">
            {form.formState.errors.password.message}
          </p>
        )}
      </div>

      <PasswordStrengthMeter 
        password={form.watch('password')} 
        className="bg-white/10 p-3 rounded-lg"
      />

      <div>
        <label className="block text-sm font-medium text-blue-100 mb-1">
          Confirmar senha *
        </label>
        <div className="relative">
          <Input
            {...form.register('confirmPassword')}
            type={showConfirmPassword ? 'text' : 'password'}
            className="bg-white/20 border-0 !text-white placeholder:!text-white/60 focus-visible:ring-white pr-10 [&:-webkit-autofill]:!bg-white/10 [&:-webkit-autofill]:!text-white [&:-webkit-autofill]:[-webkit-text-fill-color:white]"
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
        {form.formState.errors.confirmPassword && (
          <p className="text-red-300 text-sm mt-1">
            {form.formState.errors.confirmPassword.message}
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
          onClick={onBack}
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
  );
};

export default PasswordStep;
