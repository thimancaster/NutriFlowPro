
import { Patient } from '@/types';
import { Json } from '@/integrations/supabase/types';

/**
 * Helper to convert database record to a Patient object
 * Handles parsing string data from the database into objects
 */
export const convertDbToPatient = (dbRecord: any): Patient => {
  // Handle address - could be a string (from DB) or already an object
  let address = dbRecord.address;
  if (typeof address === 'string') {
    try {
      address = JSON.parse(address);
    } catch (e) {
      // If parsing fails, initialize with empty object
      address = {};
    }
  } else if (!address) {
    // If address is null/undefined
    address = {};
  }
  
  // Handle goals - could be a string (from DB) or already an object
  let goals = dbRecord.goals;
  if (typeof goals === 'string') {
    try {
      goals = JSON.parse(goals);
    } catch (e) {
      // If parsing fails, initialize with empty object
      goals = { objective: undefined, profile: undefined };
    }
  } else if (!goals) {
    // If goals is null/undefined
    goals = { objective: undefined, profile: undefined };
  }
  
  // Ensure we have the correct structure for a Patient object
  const patient: Patient = {
    ...dbRecord,
    address: address as any,
    goals: goals as any
  };

  return patient;
};

/**
 * Format data for database storage
 * Converts objects to strings for database storage
 */
export const preparePatientForDb = (patientData: Partial<Patient>): any => {
  // Create a copy to avoid modifying the original
  let dbPatientData: any = { ...patientData };
  
  // Convert address object to string for database storage
  if (dbPatientData.address && typeof dbPatientData.address === 'object') {
    dbPatientData.address = JSON.stringify(dbPatientData.address);
  }
  
  // Convert goals object to string for database storage
  if (dbPatientData.goals && typeof dbPatientData.goals === 'object') {
    dbPatientData.goals = JSON.stringify(dbPatientData.goals);
  }
  
  // Remove any non-database fields
  const { secondaryPhone, cpf, ...cleanedData } = dbPatientData;
  
  return cleanedData;
};
