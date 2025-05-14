
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
