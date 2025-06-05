
import { supabase } from '@/integrations/supabase/client';
import { Patient, AddressDetails } from '@/types/patient';

interface SavePatientResult {
  success: boolean;
  data?: Patient;
  error?: string;
}

/**
 * Save a patient to the database (insert new or update existing)
 */
export const savePatient = async (patient: Partial<Patient>): Promise<SavePatientResult> => {
  try {
    // Ensure name is required
    if (!patient.name) {
      return { 
        success: false,
        error: 'Patient name is required'
      };
    }
    
    // Ensure user_id is present
    if (!patient.user_id) {
      return {
        success: false,
        error: 'User ID is required'
      };
    }
    
    // Validate gender value before saving
    if (patient.gender && !['male', 'female', 'other'].includes(patient.gender)) {
      return {
        success: false,
        error: `Invalid gender value: ${patient.gender}. Must be 'male', 'female', or 'other'.`
      };
    }
    
    // Prepare the data for insertion/update - ensure all fields match database schema
    const patientData = {
      name: patient.name,
      user_id: patient.user_id,
      email: patient.email || null,
      phone: patient.phone || null,
      secondaryphone: patient.secondaryPhone || null, // Note: database uses 'secondaryphone'
      cpf: patient.cpf || null,
      gender: patient.gender || null,
      birth_date: patient.birth_date || null,
      status: patient.status || 'active',
      // Convert complex objects to strings for storage
      address: typeof patient.address === 'object' ? JSON.stringify(patient.address) : patient.address || null,
      goals: typeof patient.goals === 'object' ? JSON.stringify(patient.goals) : patient.goals || null,
      measurements: typeof patient.measurements === 'object' ? JSON.stringify(patient.measurements) : patient.measurements || null,
      notes: patient.notes || null,
    };

    let data, error;

    if (patient.id) {
      // Update existing patient
      console.log('Updating existing patient with ID:', patient.id);
      const updateResult = await supabase
        .from('patients')
        .update(patientData)
        .eq('id', patient.id)
        .select()
        .single();
      
      data = updateResult.data;
      error = updateResult.error;
    } else {
      // Insert new patient
      console.log('Inserting new patient');
      const insertResult = await supabase
        .from('patients')
        .insert(patientData)
        .select()
        .single();
      
      data = insertResult.data;
      error = insertResult.error;
    }

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    if (!data) {
      throw new Error('Failed to save patient');
    }

    // Convert the saved patient back to our application's format
    const savedPatient: Patient = processPatientData(data);
    
    return {
      success: true,
      data: savedPatient
    };
    
  } catch (error: any) {
    console.error('Error saving patient:', error);
    
    // Provide more specific error messages for common issues
    let errorMessage = error.message || 'Failed to save patient';
    
    if (error.message && error.message.includes('check_gender')) {
      errorMessage = 'Valor de gênero inválido. Por favor, selecione Masculino, Feminino ou Outro.';
    } else if (error.message && error.message.includes('violates')) {
      errorMessage = 'Dados inválidos. Verifique se todos os campos obrigatórios foram preenchidos corretamente.';
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

/**
 * Update an existing patient's status
 */
export const updatePatientStatus = async (
  patientId: string, 
  status: 'active' | 'archived'
): Promise<void> => {
  if (!patientId) {
    throw new Error('Patient ID is required');
  }

  try {
    const { error } = await supabase
      .from('patients')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', patientId);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error updating patient status:', error);
    throw error;
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
    secondaryPhone: data.secondaryphone, // Map database field to our type
    status: (data.status as 'active' | 'archived') || 'active',
    gender: safeGender(data.gender),
    goals: (data.goals as Record<string, any>) || {},
    measurements: (data.measurements as Record<string, any>) || {},
    address: addressData
  };

  return patient;
};
