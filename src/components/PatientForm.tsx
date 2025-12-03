
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth/AuthContext';
import { usePatient } from '@/contexts/patient/PatientContext';
import { Patient } from '@/types';
import BasicInfoFields from '@/components/patient/BasicInfoFields';
import AddressFields from '@/components/patient/AddressFields';
import NotesFields from '@/components/patient/NotesFields';

const patientSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  secondaryPhone: z.string().optional(),
  cpf: z.string().optional(),
  sex: z.enum(['M', 'F', 'O']).optional(),
  objective: z.string().optional(),
  profile: z.string().optional(),
  notes: z.string().optional(),
});

type PatientFormData = z.infer<typeof patientSchema>;

interface PatientFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: Partial<PatientFormData>;
  editPatient?: Patient;
  mode?: 'create' | 'edit';
}

// Helper function to convert gender to sex format
const convertGenderToSex = (gender?: string): "M" | "F" | "O" | undefined => {
  if (gender === 'male') return 'M';
  if (gender === 'female') return 'F';
  if (gender === 'other') return 'O';
  return undefined;
};

export const PatientForm: React.FC<PatientFormProps> = ({
  onSuccess,
  onCancel,
  initialData,
  editPatient,
  mode = 'create'
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { savePatient, isLoading } = usePatient();
  
  // Form state with proper typing
  const [formData, setFormData] = useState({
    name: editPatient?.name || initialData?.name || '',
    email: editPatient?.email || initialData?.email || '',
    phone: editPatient?.phone || initialData?.phone || '',
    secondaryPhone: editPatient?.secondaryPhone || initialData?.secondaryPhone || '',
    cpf: editPatient?.cpf || initialData?.cpf || '',
    sex: convertGenderToSex(editPatient?.gender) || initialData?.sex || undefined,
    objective: (editPatient?.goals as any)?.objective || initialData?.objective || '',
    profile: (editPatient?.goals as any)?.profile || initialData?.profile || '',
    activityLevel: (editPatient?.goals as any)?.activityLevel || '',
  });

  const [birthDate, setBirthDate] = useState<Date | undefined>(
    editPatient?.birth_date ? new Date(editPatient.birth_date) : undefined
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

  const [notes, setNotes] = useState(editPatient?.notes || initialData?.notes || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      secondaryPhone: formData.secondaryPhone,
      cpf: formData.cpf,
      sex: formData.sex,
      objective: formData.objective,
      profile: formData.profile,
      notes: notes,
    },
  });

  // Load address data if editing
  useEffect(() => {
    if (editPatient?.address) {
      if (typeof editPatient.address === 'object') {
        setAddress(editPatient.address as any);
      } else if (typeof editPatient.address === 'string' && editPatient.address.startsWith('{')) {
        try {
          setAddress(JSON.parse(editPatient.address));
        } catch {
          // Keep default empty address
        }
      }
    }
  }, [editPatient]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'sex' ? (value as "M" | "F" | "O") : value 
    }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleAddressChange = (newAddress: any) => {
    setAddress(newAddress);
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
  };

  const validateField = (field: string, value: any) => {
    // Basic validation
    if (field === 'name' && (!value || value.length < 2)) {
      setErrors(prev => ({ ...prev, [field]: 'Nome deve ter pelo menos 2 caracteres' }));
    } else if (field === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setErrors(prev => ({ ...prev, [field]: 'Email inválido' }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submission started', { formData, user });
    
    try {
      if (!user?.id) {
        toast({
          title: 'Erro',
          description: 'Usuário não autenticado',
          variant: 'destructive'
        });
        return;
      }

      // Validate required fields
      if (!formData.name || formData.name.length < 2) {
        setErrors({ name: 'Nome é obrigatório e deve ter pelo menos 2 caracteres' });
        toast({
          title: 'Erro de Validação',
          description: 'Nome é obrigatório e deve ter pelo menos 2 caracteres',
          variant: 'destructive'
        });
        return;
      }

      // Prepare patient data
      const patientData: Partial<Patient> = {
        name: formData.name,
        email: formData.email || null,
        phone: formData.phone || null,
        secondaryPhone: formData.secondaryPhone || null,
        cpf: formData.cpf || null,
        birth_date: birthDate ? birthDate.toISOString().split('T')[0] : null,
        gender: formData.sex === 'M' ? 'male' : formData.sex === 'F' ? 'female' : formData.sex === 'O' ? 'other' : undefined,
        address: Object.values(address).some(v => v) ? address : null, // Keep as object
        notes: notes || null,
        goals: {
          objective: formData.objective || '',
          profile: formData.profile || '',
          activityLevel: formData.activityLevel || '',
        },
        status: 'active',
        user_id: user.id,
      };

      // If editing, include the ID
      if (editPatient?.id) {
        patientData.id = editPatient.id;
      }

      console.log('Submitting patient data:', patientData);

      const result = await savePatient(patientData);
      
      console.log('Save result:', result);
      
      if (result.success) {
        toast({
          title: 'Sucesso!',
          description: `Paciente ${formData.name} ${mode === 'create' ? 'criado' : 'atualizado'} com sucesso.`,
        });
        
        // Reset form on success
        form.reset();
        setFormData({
          name: '', email: '', phone: '', secondaryPhone: '', 
          cpf: '', sex: undefined, objective: '', profile: '', activityLevel: ''
        });
        setBirthDate(undefined);
        setAddress({
          cep: '', street: '', number: '', complement: '', 
          neighborhood: '', city: '', state: ''
        });
        setNotes('');
        setErrors({});
        
        // Call success callback
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast({
          title: 'Erro ao salvar',
          description: result.error || 'Erro desconhecido ao salvar paciente',
          variant: 'destructive'
        });
      }
      
    } catch (error: any) {
      console.error('Error in form submission:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro inesperado ao salvar paciente',
        variant: 'destructive'
      });
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
        <form onSubmit={handleSubmit} className="space-y-6">
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
            onChange={setAddress}
            errors={errors}
            validateField={() => {}}
          />
          
          <NotesFields 
            notes={notes}
            onChange={(e) => setNotes(e.target.value)}
            errors={errors}
            validateField={() => {}}
          />
          
          <div className="flex gap-4">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="flex-1 bg-green-600 hover:bg-green-700"
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
      </CardContent>
    </Card>
  );
};
