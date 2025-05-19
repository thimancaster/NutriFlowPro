/**
 * Calculate age from birth date
 * @param birthDate - Birth date in string format (YYYY-MM-DD)
 * @returns Age in years
 */
export const calculateAge = (birthDate: string | null | undefined): number | null => {
  if (!birthDate) return null;
  
  const today = new Date();
  const dob = new Date(birthDate);
  
  let age = today.getFullYear() - dob.getFullYear();
  const monthDifference = today.getMonth() - dob.getMonth();
  
  // If birthday hasn't occurred yet this year
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Format date to local string
 * @param date - Date string or Date object
 * @returns Formatted date string
 */
export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return '-';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  try {
    return dateObj.toLocaleDateString('pt-BR');
  } catch (error) {
    return '-';
  }
};

/**
 * Get patient's age based on birth date
 * @param birthDate - Birth date string (YYYY-MM-DD)
 * @returns Age in years
 */
export const getPatientAge = (birthDate: string | null | undefined): number | null => {
  return calculateAge(birthDate);
};

/**
 * Format a patient's address for display
 * @param address - Patient address object or string
 * @returns Formatted address string
 */
export const formatPatientAddress = (address: any): string => {
  if (!address) return '';
  
  // If address is a string, try to parse it
  if (typeof address === 'string') {
    try {
      const parsedAddress = JSON.parse(address);
      return formatAddressObject(parsedAddress);
    } catch {
      return address;
    }
  }
  
  // If address is already an object
  return formatAddressObject(address);
};

/**
 * Get patient's objective from goals object
 */
export const getObjectiveFromGoals = (goals: any): string => {
  if (!goals) return '';
  
  // If goals is a string, try to parse it
  if (typeof goals === 'string') {
    try {
      const parsedGoals = JSON.parse(goals);
      return parsedGoals.objective || '';
    } catch {
      return '';
    }
  }
  
  // If goals is already an object
  return goals.objective || '';
};

/**
 * Format an address object for display
 */
const formatAddressObject = (addressObj: any): string => {
  if (!addressObj) return '';
  
  const parts = [];
  
  if (addressObj.street) {
    parts.push(`${addressObj.street}${addressObj.number ? ` ${addressObj.number}` : ''}`);
  }
  
  if (addressObj.city && addressObj.state) {
    parts.push(`${addressObj.city} - ${addressObj.state}`);
  } else if (addressObj.city) {
    parts.push(addressObj.city);
  }
  
  if (addressObj.cep) {
    parts.push(`CEP: ${addressObj.cep}`);
  }
  
  return parts.join(', ');
};

/**
 * Calculate the BMI (Body Mass Index) for a patient
 * @param weight - Weight in kg
 * @param height - Height in cm
 * @returns Calculated BMI as a string with one decimal place, or null if data is insufficient
 */
export const calculateBMI = (weight?: number, height?: number): string | null => {
  if (!weight || !height || height <= 0) return null;
  
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);
  return bmi.toFixed(1);
};

/**
 * Get patient's status information with color and icon
 * @param patient - Patient object
 * @returns Status information object
 */
export const getPatientStatusInfo = (patient: any) => {
  // Status base
  if (patient.status === 'archived') {
    return {
      label: 'Arquivado',
      color: 'gray',
      icon: 'archive',
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-800'
    };
  }
  
  // Verificar última consulta
  const lastAppointment = patient.last_appointment ? new Date(patient.last_appointment) : null;
  const today = new Date();
  
  if (!lastAppointment) {
    return {
      label: 'Novo',
      color: 'blue',
      icon: 'user-plus',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800'
    };
  }
  
  // Calcular dias desde a última consulta
  const daysSinceLastAppointment = Math.floor((today.getTime() - lastAppointment.getTime()) / (1000 * 60 * 60 * 24));
  
  // Lógica de status baseada em dias
  if (daysSinceLastAppointment > 90) {
    return {
      label: 'Atrasado',
      color: 'red',
      icon: 'alert-circle',
      bgColor: 'bg-red-100',
      textColor: 'text-red-800'
    };
  } else if (daysSinceLastAppointment > 60) {
    return {
      label: 'Atenção',
      color: 'amber',
      icon: 'alert-triangle',
      bgColor: 'bg-amber-100',
      textColor: 'text-amber-800'
    };
  } else {
    return {
      label: 'Em dia',
      color: 'green',
      icon: 'check-circle',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800'
    };
  }
};

/**
 * Get CSS classes for patient status badge
 * @param patient - Patient object
 * @returns CSS class string
 */
export const getStatusBadgeClasses = (patient: any) => {
  const statusInfo = getPatientStatusInfo(patient);
  return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.textColor}`;
};
