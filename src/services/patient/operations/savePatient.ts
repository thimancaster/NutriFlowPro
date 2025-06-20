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
    
    // Validate gender value before saving
    if (patient.gender && !['male', 'female', 'other'].includes(patient.gender)) {
      return {
        success: false,
        error: `Invalid gender value: ${patient.gender}. Must be 'male', 'female', or 'other'.`
      };
    }
    
    // Prepare the data for insertion/update - only include fields that exist in the database
    const patientData: any = {
      name: patient.name,
      email: patient.email || null,
      phone: patient.phone || null,
      cpf: patient.cpf || null,
      birth_date: patient.birth_date || null,
      gender: patient.gender || null,
      status: patient.status || 'active',
      notes: patient.notes || null,
      // Handle secondaryPhone -> secondaryphone (database column name)
      secondaryphone: patient.secondaryPhone || null,
      // Convert complex objects to JSON strings for storage
      address: typeof patient.address === 'object' ? JSON.stringify(patient.address) : patient.address || null,
      goals: typeof patient.goals === 'object' ? JSON.stringify(patient.goals) : patient.goals || null,
    };

    // Only add user_id if it exists and is not undefined
    if (patient.user_id) {
      patientData.user_id = patient.user_id;
    }

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
      // Insert new patient - user_id is required for new patients
      if (!patient.user_id) {
        return {
          success: false,
          error: 'User ID is required for new patients'
        };
      }
      
      console.log('Inserting new patient');
      const insertResult = await supabase
        .from('patients')
        .insert({
          ...patientData,
          user_id: patient.user_id // Ensure user_id is included for inserts
        })
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
    status: (data.status as 'active' | 'archived') || 'active',
    gender: safeGender(data.gender),
    goals: (data.goals as Record<string, any>) || {},
    address: addressData,
    // Handle database column name mapping
    secondaryPhone: data.secondaryphone,
    // Ensure birth_date is always present (required in Patient interface)
    birth_date: data.birth_date || ''
  };

  return patient;
};
