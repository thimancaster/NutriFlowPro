
import { Patient } from '@/types';

/**
 * Convert database patient data to the Patient type
 */
export const convertDbToPatient = (data: any): Patient => {
  // Process address data
  let addressData: Record<string, any> | undefined;
  
  if (data.address) {
    if (typeof data.address === 'string') {
      try {
        addressData = JSON.parse(data.address);
      } catch (e) {
        // If parsing fails, use the string value as is
        console.error('Failed to parse address as JSON:', e);
        addressData = { raw: data.address };
      }
    } else if (typeof data.address === 'object') {
      addressData = data.address;
    }
  }
  
  // Process goals data
  let goalsData: Record<string, any> = {};
  if (data.goals) {
    if (typeof data.goals === 'string') {
      try {
        goalsData = JSON.parse(data.goals);
      } catch (e) {
        console.error('Failed to parse goals as JSON:', e);
      }
    } else if (typeof data.goals === 'object') {
      goalsData = data.goals;
    }
  }
  
  // Process measurements data
  let measurementsData: Record<string, any> = {};
  if (data.measurements) {
    if (typeof data.measurements === 'string') {
      try {
        measurementsData = JSON.parse(data.measurements);
      } catch (e) {
        console.error('Failed to parse measurements as JSON:', e);
      }
    } else if (typeof data.measurements === 'object') {
      measurementsData = data.measurements;
    }
  }
  
  // Create a correctly structured Patient object
  const patient: Patient = {
    ...data,
    status: (data.status === 'archived' ? 'archived' : 'active'),
    goals: goalsData,
    measurements: measurementsData,
    address: addressData
  };
  
  return patient;
};

/**
 * Clean undefined values from an object to avoid overwriting with null
 */
export const cleanUndefinedValues = (obj: Record<string, any>): Record<string, any> => {
  const result: Record<string, any> = {};
  
  Object.keys(obj).forEach(key => {
    if (obj[key] !== undefined) {
      result[key] = obj[key];
    }
  });
  
  return result;
};
