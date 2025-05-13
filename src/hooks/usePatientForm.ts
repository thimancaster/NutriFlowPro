
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { PatientService } from '@/services/patientService';
import { validateField } from '@/utils/patientValidation';
import { Patient } from '@/types';

interface UsePatientFormProps {
  editPatient?: Patient;
  initialData?: any;
  onSuccess?: () => void;
  userId: string;
}

export const usePatientForm = ({ editPatient, initialData, onSuccess, userId }: UsePatientFormProps) => {
  const { toast } = useToast();
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
    status: 'active' as 'active' | 'archived',
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
      const error = validateField('address.cep', address.cep);
      if (error) {
        newErrors['address.cep'] = error;
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
    
    if (!userId) {
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
        user_id: userId,
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
        }, userId);
      } else {
        // Use the PatientService to insert new patient
        result = await PatientService.savePatient(patientData, userId);
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

  return {
    isLoading,
    birthDate,
    setBirthDate,
    activeTab,
    setActiveTab,
    errors,
    formData,
    address,
    notes,
    handleChange,
    handleSelectChange,
    handleAddressChange,
    handleNotesChange,
    handleValidateField,
    handleSubmit,
  };
};
