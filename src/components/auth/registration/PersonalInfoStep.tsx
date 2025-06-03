
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { sanitizeInput } from '@/utils/securityUtils';

const step1Schema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos').optional(),
  crn: z.string().min(4, 'CRN deve ter pelo menos 4 caracteres').optional(),
});

export type PersonalInfoData = z.infer<typeof step1Schema>;

interface PersonalInfoStepProps {
  onNext: (data: PersonalInfoData) => void;
  onBack: () => void;
}

const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({
  onNext,
  onBack
}) => {
  const form = useForm<PersonalInfoData>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      crn: '',
    },
  });

  const handleSubmit = (data: PersonalInfoData) => {
    const sanitizedData = {
      name: sanitizeInput(data.name),
      email: sanitizeInput(data.email),
      phone: data.phone ? sanitizeInput(data.phone) : undefined,
      crn: data.crn ? sanitizeInput(data.crn) : undefined,
    };
    
    onNext(sanitizedData);
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-blue-100 mb-1">
          Nome completo *
        </label>
        <Input
          {...form.register('name')}
          className="bg-white/20 border-0 text-white placeholder:text-blue-200 focus-visible:ring-white"
          placeholder="Seu nome completo"
          autoComplete="name"
        />
        {form.formState.errors.name && (
          <p className="text-red-300 text-sm mt-1">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-blue-100 mb-1">
          E-mail profissional *
        </label>
        <Input
          {...form.register('email')}
          type="email"
          className="bg-white/20 border-0 text-white placeholder:text-blue-200 focus-visible:ring-white"
          placeholder="seu@email.com"
          autoComplete="email"
        />
        {form.formState.errors.email && (
          <p className="text-red-300 text-sm mt-1">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-blue-100 mb-1">
          Telefone
        </label>
        <Input
          {...form.register('phone')}
          type="tel"
          className="bg-white/20 border-0 text-white placeholder:text-blue-200 focus-visible:ring-white"
          placeholder="(11) 99999-9999"
          autoComplete="tel"
        />
        {form.formState.errors.phone && (
          <p className="text-red-300 text-sm mt-1">
            {form.formState.errors.phone.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-blue-100 mb-1">
          CRN (Conselho Regional de Nutricionistas)
        </label>
        <Input
          {...form.register('crn')}
          className="bg-white/20 border-0 text-white placeholder:text-blue-200 focus-visible:ring-white"
          placeholder="Ex: CRN-1 12345"
        />
        {form.formState.errors.crn && (
          <p className="text-red-300 text-sm mt-1">
            {form.formState.errors.crn.message}
          </p>
        )}
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
        >
          Continuar
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </form>
  );
};

export default PersonalInfoStep;
