
import { supabase } from '@/integrations/supabase/client';
import { Patient, AddressDetails, PatientResponse } from '@/types';
import { logger } from '@/utils/logger';

export const getPatient = async (patientId: string): Promise<PatientResponse> => {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', patientId)
      .single();

    if (error) {
      logger.error('Error fetching patient:', error);
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: false, error: 'Patient not found' };
    }

    const patient = processPatientData(data);
    return { success: true, data: patient };
  } catch (error: any) {
    logger.error('Error in getPatient:', error);
    return { success: false, error: error.message };
  }
};

export const getPatientsByUserId = async (userId: string): Promise<{ success: boolean; data?: Patient[]; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      logger.error('Error fetching patients:', error);
      return { success: false, error: error.message };
    }

    const patients = data.map(processPatientData);
    return { success: true, data: patients };
  } catch (error: any) {
    logger.error('Error in getPatientsByUserId:', error);
    return { success: false, error: error.message };
  }
};

const processPatientData = (data: any): Patient => {
  // Process address data properly
  let addressData: string | AddressDetails | undefined;
  
  if (data.address) {
    if (typeof data.address === 'string') {
      try {
        // Try to parse the address as JSON if it's a string
        addressData = JSON.parse(data.address as string) as AddressDetails;
      } catch (e) {
        // If parsing fails, keep it as a string
        addressData = data.address as string;
      }
    } else if (typeof data.address === 'object') {
      // If it's already an object, use it directly
      addressData = data.address as AddressDetails;
    }
  }

  // Safely cast gender with fallback
  const safeGender = (gender: any): 'male' | 'female' | 'other' | undefined => {
    if (gender === 'male' || gender === 'female' || gender === 'other') {
      return gender;
    }
    return undefined;
  };

  // Process database data into our Patient type
  const patient: Patient = {
    ...data,
    status: (data.status as 'active' | 'archived') || 'active',
    gender: safeGender(data.gender),
    goals: (data.goals as Record<string, any>) || {},
    measurements: (data.measurements as Record<string, any>) || {},
    address: addressData
  };

  return patient;
};

export type { PatientResponse };
