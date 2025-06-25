
import { Patient } from '@/types';

export const useCalculatorSync = () => {
  const syncPatientData = (
    patient: Patient,
    currentData: any,
    handleInputChange: (name: string, value: any) => void
  ) => {
    // Sync patient data to form
    if (patient.name !== currentData.patientName) {
      handleInputChange('patientName', patient.name);
    }
    
    if (patient.weight && patient.weight !== Number(currentData.weight)) {
      handleInputChange('weight', patient.weight.toString());
    }
    
    if (patient.height && patient.height !== Number(currentData.height)) {
      handleInputChange('height', patient.height.toString());
    }
    
    if (patient.birth_date) {
      const age = calculateAgeFromBirthDate(patient.birth_date);
      if (age !== Number(currentData.age)) {
        handleInputChange('age', age.toString());
      }
    }
    
    if (patient.sex && patient.sex !== currentData.sex) {
      handleInputChange('sex', patient.sex);
    }
  };

  const calculateAgeFromBirthDate = (birthDate: string): number => {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  return {
    syncPatientData
  };
};
