
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
