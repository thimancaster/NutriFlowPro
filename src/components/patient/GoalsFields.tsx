
import React from 'react';
import { SelectField, RadioGroupField } from './FormFields';

interface GoalsFieldsProps {
  formData: {
    objective: string;
    profile: string;
  };
  handleSelectChange: (name: string, value: string) => void;
}

const GoalsFields = ({ formData, handleSelectChange }: GoalsFieldsProps) => {
  return (
    <>
      <SelectField 
        id="objective" 
        label="Objetivo" 
        value={formData.objective} 
        onChange={(value) => handleSelectChange('objective', value)} 
        required
        options={[
          { value: "emagrecimento", label: "Emagrecimento" },
          { value: "manutenção", label: "Manutenção" },
          { value: "hipertrofia", label: "Hipertrofia" }
        ]}
      />
      
      <RadioGroupField 
        label="Perfil" 
        value={formData.profile} 
        onChange={(value) => handleSelectChange('profile', value)} 
        required
        options={[
          { value: "magro", label: "Magro" },
          { value: "obeso", label: "Obeso" },
          { value: "atleta", label: "Atleta" }
        ]}
        className="flex flex-col space-y-1"
      />
    </>
  );
};

export default GoalsFields;
