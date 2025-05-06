
import React from 'react';
import { TextField, RadioGroupField, DateField } from './FormFields';
import { useToast } from '@/hooks/use-toast';

interface BasicInfoFieldsProps {
  formData: {
    name: string;
    email: string;
    phone: string;
    sex: string;
  };
  birthDate: Date | undefined;
  setBirthDate: (date: Date | undefined) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  errors?: Record<string, string>;
}

const BasicInfoFields = ({ 
  formData, 
  birthDate, 
  setBirthDate, 
  handleChange,
  handleSelectChange,
  errors = {}
}: BasicInfoFieldsProps) => {
  const { toast } = useToast();
  
  const validateGender = () => {
    if (!formData.sex) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, selecione o sexo do paciente.",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };
  
  return (
    <>
      <TextField 
        id="name" 
        name="name" 
        label="Nome Completo" 
        value={formData.name} 
        onChange={handleChange} 
        required 
        error={errors.name}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField 
          id="email" 
          name="email" 
          label="Email" 
          value={formData.email} 
          onChange={handleChange}
          type="email"
          error={errors.email}
        />
        
        <TextField 
          id="phone" 
          name="phone" 
          label="Telefone" 
          value={formData.phone} 
          onChange={handleChange}
          error={errors.phone}
        />
      </div>
      
      <RadioGroupField 
        label="Sexo" 
        value={formData.sex} 
        onChange={(value) => handleSelectChange('sex', value)} 
        required
        options={[
          { value: "M", label: "Masculino" },
          { value: "F", label: "Feminino" }
        ]}
        error={errors.sex}
        onBlur={validateGender}
      />
      
      <DateField 
        value={birthDate} 
        onChange={setBirthDate} 
        error={errors.birthDate}
      />
    </>
  );
};

export default BasicInfoFields;
