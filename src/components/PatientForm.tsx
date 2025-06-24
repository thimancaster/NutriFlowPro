
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useSecureOperations } from '@/hooks/useSecureOperations';
import { validatePatientData } from '@/utils/validation/enhancedValidation';
import BasicInfoFields from '@/components/patient/BasicInfoFields';
import AddressFields from '@/components/patient/AddressFields';
import NotesFields from '@/components/patient/NotesFields';

const patientSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  cpf: z.string().optional(),
  birth_date: z.string().optional(),
  gender: z.enum(['M', 'F']).optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

type PatientFormData = z.infer<typeof patientSchema>;

interface PatientFormProps {
  onSuccess?: () => void;
  initialData?: Partial<PatientFormData>;
  mode?: 'create' | 'edit';
}

export const PatientForm: React.FC<PatientFormProps> = ({
  onSuccess,
  initialData,
  mode = 'create'
}) => {
  const { toast } = useToast();
  const { secureCreatePatient, isLoading } = useSecureOperations();
  
  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: initialData?.name || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      cpf: initialData?.cpf || '',
      birth_date: initialData?.birth_date || '',
      gender: initialData?.gender || undefined,
      address: initialData?.address || '',
      notes: initialData?.notes || '',
    },
  });

  const onSubmit = async (data: PatientFormData) => {
    try {
      // Validate data with enhanced security validation
      const validation = validatePatientData(data);
      
      if (!validation.isValid) {
        toast({
          title: 'Dados inválidos',
          description: validation.errors.join(', '),
          variant: 'destructive'
        });
        return;
      }

      // Use secure operation for creating patient
      await secureCreatePatient(validation.sanitizedData);
      
      // Reset form and call success callback
      form.reset();
      onSuccess?.();
      
    } catch (error: any) {
      console.error('Error creating patient:', error);
      // Error is already handled by useSecureOperations hook
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {mode === 'create' ? 'Novo Paciente' : 'Editar Paciente'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <BasicInfoFields form={form} />
            <AddressFields form={form} />
            <NotesFields form={form} />
            
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Salvando...' : mode === 'create' ? 'Criar Paciente' : 'Atualizar Paciente'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
