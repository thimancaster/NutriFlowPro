
import React from 'react';
import TextField from './fields/TextField';
import { RadioGroupField, DateField } from './fields';
import { formatPhone, formatCpf } from '@/utils/patientValidation';

interface BasicInfoFieldsProps {
  formData: {
    name: string;
    email: string;
    phone: string;
    secondaryPhone: string;
    cpf: string;
    sex: string;
  };
  birthDate: Date | undefined;
  setBirthDate: (date: Date | undefined) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  errors: Record<string, string>;
  validateField: (field: string, value: any) => void;
}

const BasicInfoFields = ({ 
  formData, 
  birthDate, 
  setBirthDate, 
  handleChange,
  handleSelectChange,
  errors,
  validateField
}: BasicInfoFieldsProps) => {
  
  const handleFieldBlur = (fieldName: string, value: any) => {
    console.log('Field blur:', fieldName, value);
    validateField(fieldName, value);
  };

  return (
    <>
      <TextField 
        id="name" 
        name="name" 
        label="Nome Completo" 
        value={formData.name || ''} 
        onChange={handleChange} 
        required 
        error={errors.name}
        onBlur={() => handleFieldBlur('name', formData.name)}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField 
          id="cpf" 
          name="cpf" 
          label="CPF" 
          value={formData.cpf || ''} 
          onChange={handleChange} 
          mask={formatCpf}
          placeholder="000.000.000-00"
          error={errors.cpf}
          onBlur={() => handleFieldBlur('cpf', formData.cpf)}
        />
        
        <RadioGroupField 
          label="Sexo" 
          value={formData.sex || ''} 
          onChange={(value) => {
            handleSelectChange('sex', value);
            handleFieldBlur('sex', value);
          }} 
          required
          options={[
            { value: "M", label: "Masculino" },
            { value: "F", label: "Feminino" },
            { value: "O", label: "Outro" }
          ]}
          error={errors.sex}
        />
      </div>
      
      <DateField 
        value={birthDate} 
        onChange={(date) => {
          setBirthDate(date);
          handleFieldBlur('birthDate', date);
        }}
        label="Data de Nascimento"
        required
        error={errors.birthDate}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField 
          id="phone" 
          name="phone" 
          label="Telefone Principal" 
          value={formData.phone || ''} 
          onChange={handleChange}
          required
          mask={formatPhone}
          placeholder="(00) 00000-0000"
          error={errors.phone}
          onBlur={() => handleFieldBlur('phone', formData.phone)}
        />
        
        <TextField 
          id="secondaryPhone" 
          name="secondaryPhone" 
          label="Telefone Secundário" 
          value={formData.secondaryPhone || ''} 
          onChange={handleChange}
          mask={formatPhone}
          placeholder="(00) 00000-0000"
          error={errors.secondaryPhone}
          onBlur={() => handleFieldBlur('secondaryPhone', formData.secondaryPhone)}
        />
      </div>
      
      <TextField 
        id="email" 
        name="email" 
        label="Email" 
        value={formData.email || ''} 
        onChange={handleChange}
        type="email"
        placeholder="exemplo@email.com"
        error={errors.email}
        onBlur={() => handleFieldBlur('email', formData.email)}
      />
    </>
  );
};

export default BasicInfoFields;
