
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth/AuthContext';
import { PatientService } from '@/services/patientService';
import { validateField } from '@/utils/patientValidation';

import BasicInfoFields from './patient/BasicInfoFields';
import GoalsFields from './patient/GoalsFields';
import AddressFields from './patient/AddressFields';
import NotesFields from './patient/NotesFields';
import FormActions from './patient/FormActions';

interface PatientFormProps {
  onSuccess?: () => void;
  editPatient?: any;
  onCancel?: () => void;
  initialData?: any;
}

const PatientForm = ({ onSuccess, editPatient, onCancel, initialData }: PatientFormProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [birthDate, setBirthDate] = useState<Date | undefined>(undefined);
  const [activeTab, setActiveTab] = useState("basic-info");
  
  // Error state
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    sex: '',
    objective: '',
    profile: '',
    email: '',
    phone: '',
    secondaryPhone: '',
    cpf: '',
    status: 'active',
  });

  // Address state
  const [address, setAddress] = useState({
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
  });

  // Notes state
  const [notes, setNotes] = useState('');

  // If we're editing a patient or have initial data, populate the form
  useEffect(() => {
    if (editPatient) {
      setFormData({
        name: editPatient.name || '',
        sex: editPatient.gender || '',
        objective: editPatient.goals?.objective || '',
        profile: editPatient.goals?.profile || '',
        email: editPatient.email || '',
        phone: editPatient.phone || '',
        secondaryPhone: editPatient.secondaryPhone || '',
        cpf: editPatient.cpf || '',
        status: editPatient.status || 'active',
      });

      if (editPatient.address) {
        setAddress({
          cep: editPatient.address.cep || '',
          street: editPatient.address.street || '',
          number: editPatient.address.number || '',
          complement: editPatient.address.complement || '',
          neighborhood: editPatient.address.neighborhood || '',
          city: editPatient.address.city || '',
          state: editPatient.address.state || '',
        });
      }

      setNotes(editPatient.notes || '');

      if (editPatient.birth_date) {
        setBirthDate(new Date(editPatient.birth_date));
      }
    } else if (initialData) {
      // Use data passed from calculator
      setFormData({
        name: initialData.name || '',
        sex: initialData.gender || '',
        objective: initialData.objective || '',
        profile: initialData.profile || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        secondaryPhone: initialData.secondaryPhone || '',
        cpf: initialData.cpf || '',
        status: 'active',
      });
      
      if (initialData.age) {
        // Set an approximate birth date based on age
        const today = new Date();
        const birthYear = today.getFullYear() - parseInt(initialData.age);
        setBirthDate(new Date(birthYear, 0, 1));
      }
    }
  }, [editPatient, initialData]);

  // Validate a field and update errors state
  const handleValidateField = (field: string, value: any) => {
    const error = validateField(field, value);
    setErrors(prev => ({
      ...prev,
      [field]: error || '',
    }));
    return !error;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (newAddress: typeof address) => {
    setAddress(newAddress);
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
  };

  // Validate the entire form
  const validateForm = () => {
    let isValid = true;
    const newErrors = {} as Record<string, string>;
    
    // Validate basic info
    const fields = ['name', 'sex', 'email', 'phone', 'secondaryPhone', 'cpf', 'objective', 'profile'];
    fields.forEach(field => {
      const error = validateField(field, formData[field as keyof typeof formData]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });
    
    // Validate birth date
    if (!birthDate) {
      newErrors.birthDate = 'Data de nascimento é obrigatória';
      isValid = false;
    }
    
    // Address validation can be partial
    if (address.cep) {
      const cepError = validateField('address.cep', address.cep);
      if (cepError) {
        newErrors['address.cep'] = cepError;
        isValid = false;
      }
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Formulário inválido",
        description: "Por favor, corrija os campos destacados.",
        variant: "destructive",
      });
      return;
    }
    
    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para cadastrar pacientes.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);

    try {
      // Format data for Supabase
      const patientData = {
        name: formData.name,
        gender: formData.sex,
        birth_date: birthDate ? birthDate.toISOString().split('T')[0] : null, // Format as YYYY-MM-DD
        email: formData.email || null,
        phone: formData.phone || null,
        secondaryPhone: formData.secondaryPhone || null,
        cpf: formData.cpf || null,
        user_id: user.id,
        status: formData.status,
        address: Object.values(address).some(value => value) ? address : null,
        notes: notes || null,
        goals: {
          objective: formData.objective,
          profile: formData.profile,
        },
      };

      let result;
      
      if (editPatient) {
        // Use the PatientService to update existing patient
        result = await PatientService.savePatient({
          ...patientData,
          id: editPatient.id
        }, user.id);
      } else {
        // Use the PatientService to insert new patient
        result = await PatientService.savePatient(patientData, user.id);
      }
      
      if (!result.success) {
        throw new Error(result.error || "Falha ao salvar paciente");
      }
      
      toast({
        title: editPatient ? "Paciente atualizado" : "Paciente cadastrado",
        description: `${formData.name} foi ${editPatient ? 'atualizado' : 'adicionado(a)'} com sucesso.`,
      });
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (error: any) {
      console.error("Error saving patient:", error);
      toast({
        title: "Erro ao salvar paciente",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="nutri-card w-full">
      <CardHeader>
        <CardTitle>{editPatient ? "Editar Paciente" : "Cadastro de Paciente"}</CardTitle>
        <CardDescription>
          Preencha os dados para {editPatient ? "atualizar" : "cadastrar"} um {editPatient ? "" : "novo"} paciente
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="basic-info">Informações Básicas</TabsTrigger>
              <TabsTrigger value="address">Endereço</TabsTrigger>
              <TabsTrigger value="goals-notes">Objetivos e Observações</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic-info" className="space-y-4">
              <BasicInfoFields 
                formData={formData}
                birthDate={birthDate}
                setBirthDate={setBirthDate}
                handleChange={handleChange}
                handleSelectChange={handleSelectChange}
                errors={errors}
                validateField={handleValidateField}
              />
            </TabsContent>
            
            <TabsContent value="address" className="space-y-4">
              <AddressFields 
                address={address}
                onChange={handleAddressChange}
                errors={errors}
                validateField={handleValidateField}
              />
            </TabsContent>
            
            <TabsContent value="goals-notes" className="space-y-4">
              <GoalsFields 
                formData={{ objective: formData.objective, profile: formData.profile }}
                handleSelectChange={handleSelectChange}
                errors={errors}
                validateField={handleValidateField}
              />
              
              <NotesFields 
                notes={notes}
                onChange={handleNotesChange}
                errors={errors}
                validateField={handleValidateField}
              />
            </TabsContent>
          </Tabs>
          
          <CardFooter className="px-0 pt-2 pb-0">
            <FormActions 
              isLoading={isLoading}
              onCancel={onCancel}
              isEditMode={!!editPatient}
            />
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
};

export default PatientForm;
