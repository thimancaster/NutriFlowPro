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
    console.log('savePatient called with:', patient);
    
    // Ensure name is required
    if (!patient.name || patient.name.trim().length < 2) {
      return { 
        success: false,
        error: 'Nome do paciente é obrigatório e deve ter pelo menos 2 caracteres'
      };
    }
    
    // Validate gender value before saving
    if (patient.gender && !['male', 'female', 'other'].includes(patient.gender)) {
      return {
        success: false,
        error: `Valor de gênero inválido: ${patient.gender}. Deve ser 'male', 'female', ou 'other'.`
      };
    }
    
    // Prepare the data for insertion/update - only include fields that exist in the database
    const patientData: any = {
      name: patient.name.trim(),
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
      address: patient.address ? (typeof patient.address === 'object' ? JSON.stringify(patient.address) : patient.address) : null,
      goals: patient.goals ? (typeof patient.goals === 'object' ? JSON.stringify(patient.goals) : patient.goals) : null,
    };

    // Only add user_id if it exists
    if (patient.user_id) {
      patientData.user_id = patient.user_id;
    }

    console.log('Prepared patient data for database:', patientData);

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
          error: 'ID do usuário é obrigatório para novos pacientes'
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
      
      // Handle specific Supabase errors
      if (error.code === '23505') {
        return {
          success: false,
          error: 'Já existe um paciente com estes dados. Verifique se não há duplicatas.'
        };
      }
      
      if (error.message?.includes('violates check constraint')) {
        return {
          success: false,
          error: 'Dados inválidos. Verifique os campos preenchidos.'
        };
      }
      
      return {
        success: false,
        error: error.message || 'Erro desconhecido ao salvar paciente'
      };
    }

    if (!data) {
      return {
        success: false,
        error: 'Nenhum dado retornado após salvar paciente'
      };
    }

    console.log('Patient successfully saved:', data);

    // Convert the saved patient back to our application's format
    const savedPatient: Patient = processPatientData(data);
    
    return {
      success: true,
      data: savedPatient
    };
    
  } catch (error: any) {
    console.error('Error in savePatient:', error);
    
    // Provide more specific error messages for common issues
    let errorMessage = error.message || 'Erro desconhecido ao salvar paciente';
    
    if (error.message?.includes('check_gender')) {
      errorMessage = 'Valor de gênero inválido. Por favor, selecione Masculino, Feminino ou Outro.';
    } else if (error.message?.includes('violates')) {
      errorMessage = 'Dados inválidos. Verifique se todos os campos obrigatórios foram preenchidos corretamente.';
    } else if (error.message?.includes('network')) {
      errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
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
    throw new Error('ID do paciente é obrigatório');
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

  // Process goals data properly
  let goalsData: any = {};
  if (data.goals) {
    if (typeof data.goals === 'string') {
      try {
        goalsData = JSON.parse(data.goals);
      } catch (e) {
        console.warn('Failed to parse goals JSON:', e);
        goalsData = {};
      }
    } else if (typeof data.goals === 'object') {
      goalsData = data.goals;
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
    id: data.id,
    name: data.name,
    email: data.email || '',
    phone: data.phone || '',
    secondaryPhone: data.secondaryphone || '',
    cpf: data.cpf || '',
    birth_date: data.birth_date || '',
    gender: safeGender(data.gender),
    address: addressData,
    notes: data.notes || '',
    status: (data.status as 'active' | 'archived') || 'active',
    goals: goalsData,
    created_at: data.created_at,
    updated_at: data.updated_at,
    user_id: data.user_id,
    // Calculate age if birth_date is available
    age: data.birth_date ? calculateAge(data.birth_date) : undefined
  };

  return patient;
};

// Helper function to calculate age
const calculateAge = (birthDate: string): number => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return Math.max(0, age); // Ensure age is never negative
};
