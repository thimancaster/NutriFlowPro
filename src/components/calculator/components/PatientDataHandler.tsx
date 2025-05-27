
import React, { useEffect } from 'react';
import { Patient } from '@/types';

interface PatientDataHandlerProps {
  patientData?: Patient | null;
  onPatientNameChange: (name: string) => void;
  onWeightChange: (weight: string) => void;
  onHeightChange: (height: string) => void;
  onAgeChange: (age: string) => void;
  onSexChange: (sex: 'M' | 'F') => void;
  onInputChange: (field: string, value: number) => void;
}

export const PatientDataHandler: React.FC<PatientDataHandlerProps> = ({
  patientData,
  onPatientNameChange,
  onWeightChange,
  onHeightChange,
  onAgeChange,
  onSexChange,
  onInputChange
}) => {
  useEffect(() => {
    if (patientData) {
      // Set patient name
      onPatientNameChange(patientData.name);
      
      // Set measurements if available
      if (patientData.measurements) {
        if (patientData.measurements.weight) {
          onWeightChange(patientData.measurements.weight.toString());
          onInputChange('weight', Number(patientData.measurements.weight));
        }
        if (patientData.measurements.height) {
          onHeightChange(patientData.measurements.height.toString());
          onInputChange('height', Number(patientData.measurements.height));
        }
      }
      
      // Calculate age from birth_date if available
      if (patientData.birth_date) {
        const birthDate = new Date(patientData.birth_date);
        const today = new Date();
        let calculatedAge = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          calculatedAge--;
        }
        
        onAgeChange(calculatedAge.toString());
        onInputChange('age', calculatedAge);
      }
      
      // Set gender/sex if available
      if (patientData.gender) {
        onSexChange(patientData.gender === 'male' ? 'M' : 'F');
      }
    }
  }, [patientData, onPatientNameChange, onWeightChange, onHeightChange, onAgeChange, onSexChange, onInputChange]);

  return null;
};
