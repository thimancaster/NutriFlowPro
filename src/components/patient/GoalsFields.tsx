import React from 'react';
import { SelectField, RadioGroupField } from './fields';

interface GoalsFieldsProps {
  formData: {
    objective: string;
    profile: string;
  };
  handleSelectChange: (name: string, value: string) => void;
  errors: Record<string, string>;
  validateField: (field: string, value: any) => void;
}

const GoalsFields = ({ formData, handleSelectChange, errors, validateField }: GoalsFieldsProps) => {
  return (
    <>
      <SelectField 
        id="objective" 
        label="Objetivo" 
        value={formData.objective || ''} 
        onChange={(value) => {
          handleSelectChange('objective', value);
          validateField('objective', value);
        }} 
        required
        options={[
          { value: "emagrecimento", label: "Emagrecimento" },
          { value: "manutenção", label: "Manutenção" },
          { value: "hipertrofia", label: "Hipertrofia" },
          { value: "saúde", label: "Saúde" },
          { value: "desempenho", label: "Desempenho" }
        ]}
        error={errors.objective}
        onBlur={() => validateField('objective', formData.objective)}
      />
      
      <RadioGroupField 
        label="Perfil" 
        value={formData.profile || ''} 
        onChange={(value) => {
          handleSelectChange('profile', value);
          validateField('profile', value);
        }} 
        required
        options={[
          { value: "sedentário", label: "Sedentário" },
          { value: "moderado", label: "Moderado" },
          { value: "ativo", label: "Ativo" },
          { value: "muito ativo", label: "Muito Ativo" }
        ]}
        className="flex flex-col space-y-1"
        error={errors.profile}
        onBlur={() => validateField('profile', formData.profile)}
      />
    </>
  );
};

export default GoalsFields;
