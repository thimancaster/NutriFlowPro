
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth/AuthContext';

import BasicInfoFields from './patient/BasicInfoFields';
import GoalsFields from './patient/GoalsFields';
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
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    sex: '',
    objective: '',
    profile: '',
    email: '',
    phone: '',
  });

  // If we're editing a patient or have initial data, populate the form
  useEffect(() => {
    if (editPatient) {
      setFormData({
        name: editPatient.name || '',
        sex: editPatient.gender === 'F' ? 'F' : 'M',
        objective: editPatient.goals?.objective || '',
        profile: editPatient.goals?.profile || '',
        email: editPatient.email || '',
        phone: editPatient.phone || '',
      });

      if (editPatient.birth_date) {
        setBirthDate(new Date(editPatient.birth_date));
      }
    } else if (initialData) {
      // Use data passed from calculator
      setFormData({
        name: initialData.name || '',
        sex: initialData.gender === 'F' ? 'F' : 'M',
        objective: initialData.objective || '',
        profile: '',
        email: '',
        phone: '',
      });
      
      if (initialData.age) {
        // Set an approximate birth date based on age
        const today = new Date();
        const birthYear = today.getFullYear() - parseInt(initialData.age);
        setBirthDate(new Date(birthYear, 0, 1));
      }
    }
  }, [editPatient, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!birthDate) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, selecione a data de nascimento.",
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
        birth_date: birthDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
        email: formData.email || null,
        phone: formData.phone || null,
        user_id: user.id,
        goals: {
          objective: formData.objective,
          profile: formData.profile,
        },
      };

      let result;
      
      if (editPatient) {
        // Update existing patient
        result = await supabase
          .from('patients')
          .update(patientData)
          .eq('id', editPatient.id);
      } else {
        // Insert new patient
        result = await supabase
          .from('patients')
          .insert(patientData);
      }
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      toast({
        title: editPatient ? "Paciente atualizado" : "Paciente cadastrado",
        description: `${formData.name} foi ${editPatient ? 'atualizado' : 'adicionado(a)'} com sucesso.`,
      });
      
      // Reset form
      if (!editPatient) {
        setFormData({
          name: '',
          sex: '',
          objective: '',
          profile: '',
          email: '',
          phone: '',
        });
        setBirthDate(undefined);
      }
      
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
          <div className="space-y-4">
            <BasicInfoFields 
              formData={formData}
              birthDate={birthDate}
              setBirthDate={setBirthDate}
              handleChange={handleChange}
              handleSelectChange={handleSelectChange}
            />
            
            <GoalsFields 
              formData={formData}
              handleSelectChange={handleSelectChange}
            />
          </div>
          
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
