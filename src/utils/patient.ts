
import { Patient } from '@/types/patient';

/**
 * Calculate age from birth date
 * @param birthDate Birth date as string
 * @returns Age in years (or null if birthDate is invalid)
 */
export const calculateAge = (birthDate: string | null | undefined): number | null => {
  if (!birthDate) return null;
  
  const today = new Date();
  const birth = new Date(birthDate);
  
  // Check if date is valid
  if (isNaN(birth.getTime())) return null;
  
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  // Adjust age if birthday hasn't occurred yet this year
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Calculate BMI from weight and height
 * @param weight Weight in kg
 * @param heightCm Height in cm
 * @returns BMI value (or null if inputs are invalid)
 */
export const calculateBMI = (weight: number | undefined, heightCm: number | undefined): number | null => {
  if (!weight || !heightCm || heightCm <= 0) return null;
  
  const heightM = heightCm / 100;
  return Number((weight / (heightM * heightM)).toFixed(1));
};

/**
 * Get status information for a patient
 * @param patient Patient object
 * @returns Status information object with label, color, and icon
 */
export const getPatientStatusInfo = (patient: Patient) => {
  if (patient.status === 'archived') {
    return {
      label: 'Arquivado',
      color: 'gray',
      icon: 'archive'
    };
  }
  
  // Check last appointment date
  const lastAppointment = patient.last_appointment ? new Date(patient.last_appointment) : null;
  const today = new Date();
  
  if (!lastAppointment) {
    return {
      label: 'Novo',
      color: 'blue',
      icon: 'user-plus'
    };
  }
  
  // Calculate days since last appointment
  const daysSinceLastAppointment = Math.floor(
    (today.getTime() - lastAppointment.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  if (daysSinceLastAppointment > 90) {
    return {
      label: 'Atrasado',
      color: 'red',
      icon: 'alert-circle'
    };
  } else if (daysSinceLastAppointment > 60) {
    return {
      label: 'Atenção',
      color: 'amber',
      icon: 'alert-triangle'
    };
  } else {
    return {
      label: 'Em dia',
      color: 'green',
      icon: 'check-circle'
    };
  }
};
