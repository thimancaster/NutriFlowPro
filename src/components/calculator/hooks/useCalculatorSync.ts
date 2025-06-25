
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
    
    // Note: Patient type doesn't have weight/height/sex properties
    // These would need to come from measurements or anthropometry data
    // For now, we'll skip these fields to avoid build errors
    
    if (patient.birth_date) {
      const age = calculateAgeFromBirthDate(patient.birth_date);
      if (age !== Number(currentData.age)) {
        handleInputChange('age', age.toString());
      }
    }
    
    if (patient.gender && patient.gender !== currentData.sex) {
      // Map gender to sex format expected by calculator
      const sex = patient.gender.toLowerCase() === 'masculino' ? 'M' : 'F';
      handleInputChange('sex', sex);
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
