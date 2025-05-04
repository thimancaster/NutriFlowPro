
import React from 'react';
import { TextField, RadioGroupField, DateField } from './FormFields';

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
}

const BasicInfoFields = ({ 
  formData, 
  birthDate, 
  setBirthDate, 
  handleChange,
  handleSelectChange 
}: BasicInfoFieldsProps) => {
  return (
    <>
      <TextField 
        id="name" 
        name="name" 
        label="Nome Completo" 
        value={formData.name} 
        onChange={handleChange} 
        required 
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField 
          id="email" 
          name="email" 
          label="Email" 
          value={formData.email} 
          onChange={handleChange}
          type="email"
        />
        
        <TextField 
          id="phone" 
          name="phone" 
          label="Telefone" 
          value={formData.phone} 
          onChange={handleChange}
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
      />
      
      <DateField 
        value={birthDate} 
        onChange={setBirthDate} 
      />
    </>
  );
};

export default BasicInfoFields;
