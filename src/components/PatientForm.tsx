
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
  onCancel?: () => void;
  initialData?: Partial<PatientFormData>;
  editPatient?: any;
  mode?: 'create' | 'edit';
}

export const PatientForm: React.FC<PatientFormProps> = ({
  onSuccess,
  onCancel,
  initialData,
  editPatient,
  mode = 'create'
}) => {
  const { toast } = useToast();
  const { secureCreatePatient, isLoading } = useSecureOperations();
  
  // Use editPatient data if available, otherwise use initialData
  const defaultValues = editPatient || initialData || {};
  
  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: defaultValues?.name || '',
      email: defaultValues?.email || '',
      phone: defaultValues?.phone || '',
      cpf: defaultValues?.cpf || '',
      birth_date: defaultValues?.birth_date || '',
      gender: defaultValues?.gender || undefined,
      address: defaultValues?.address || '',
      notes: defaultValues?.notes || '',
    },
  });

  // State for managing form data in the expected format for field components
  const [formData, setFormData] = useState({
    name: defaultValues?.name || '',
    email: defaultValues?.email || '',
    phone: defaultValues?.phone || '',
    secondaryPhone: '',
    cpf: defaultValues?.cpf || '',
    sex: defaultValues?.gender || '',
  });

  const [birthDate, setBirthDate] = useState<Date | undefined>(
    defaultValues?.birth_date ? new Date(defaultValues.birth_date) : undefined
  );

  const [address, setAddress] = useState({
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
  });

  const [notes, setNotes] = useState(defaultValues?.notes || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (newAddress: any) => {
    setAddress(newAddress);
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
  };

  const validateField = (field: string, value: any) => {
    // Basic validation - you can expand this
    if (field === 'name' && (!value || value.length < 2)) {
      setErrors(prev => ({ ...prev, [field]: 'Nome deve ter pelo menos 2 caracteres' }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const onSubmit = async (data: PatientFormData) => {
    try {
      // Combine all form data
      const combinedData = {
        ...formData,
        birth_date: birthDate?.toISOString().split('T')[0],
        address: address,
        notes: notes,
        gender: formData.sex,
      };

      // Validate data with enhanced security validation
      const validation = validatePatientData(combinedData);
      
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
            <BasicInfoFields 
              formData={formData}
              birthDate={birthDate}
              setBirthDate={setBirthDate}
              handleChange={handleChange}
              handleSelectChange={handleSelectChange}
              errors={errors}
              validateField={validateField}
            />
            
            <AddressFields 
              address={address}
              onChange={handleAddressChange}
              errors={errors}
              validateField={validateField}
            />
            
            <NotesFields 
              notes={notes}
              onChange={handleNotesChange}
              errors={errors}
              validateField={validateField}
            />
            
            <div className="flex gap-4">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Salvando...' : mode === 'create' ? 'Criar Paciente' : 'Atualizar Paciente'}
              </Button>
              
              {onCancel && (
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
