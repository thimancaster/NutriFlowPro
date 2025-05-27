
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
      
      <SelectField 
        id="profile" 
        label="Perfil Corporal" 
        value={formData.profile || ''} 
        onChange={(value) => {
          handleSelectChange('profile', value);
          validateField('profile', value);
        }} 
        required
        options={[
          { value: "eutrofico", label: "Eutrófico (Normal)" },
          { value: "sobrepeso_obesidade", label: "Sobrepeso/Obesidade" },
          { value: "atleta", label: "Atleta" }
        ]}
        error={errors.profile}
        onBlur={() => validateField('profile', formData.profile)}
      />
    </>
  );
};

export default GoalsFields;
