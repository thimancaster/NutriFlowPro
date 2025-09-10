
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface CalculationData {
  patient_id: string;
  weight: number;
  height: number;
  age: number;
  gender: string;
  activity_level: string;
  goal: string;
  bmr: number;
  tdee: number;
  protein: number;
  carbs: number;
  fats: number;
  tipo: string;
  status: string;
  user_id: string;
}

export async function saveCalculationResults(data: CalculationData) {
  try {
    console.log('Saving calculation data:', data);
    
    // Validate required fields
    if (!data.user_id || !data.patient_id) {
      console.error('Missing required fields:', { user_id: data.user_id, patient_id: data.patient_id });
      return { success: false, error: 'Campos obrigatórios faltando' };
    }
    
    // Normalize gender to ensure it's 'M' or 'F'
    const normalizedGender = normalizeGender(data.gender);
    console.log('Gender normalized from', data.gender, 'to', normalizedGender);
    
    // Insert calculation record
    const { data: calculation, error } = await supabase
      .from('calculations')
      .insert({
        ...data,
        gender: normalizedGender,
        created_at: new Date().toISOString()
      })
      .select('*')
      .single();
    
    if (error) {
      console.error('Database error saving calculation:', error);
      throw error;
    }
    
    return { success: true, data: calculation };
  } catch (error: any) {
    console.error('Error saving calculation results:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Normalizes gender values to ensure they match database constraints
 */
function normalizeGender(gender: string): 'M' | 'F' {
  if (!gender) return 'M'; // Default to Male if no gender provided
  
  const normalizedValue = gender.toString().trim().toUpperCase();
  
  // Handle various formats
  if (normalizedValue === 'M' || normalizedValue === 'MALE' || normalizedValue === 'MASCULINO') {
    return 'M';
  }
  
  if (normalizedValue === 'F' || normalizedValue === 'FEMALE' || normalizedValue === 'FEMININO') {
    return 'F';
  }
  
  // Default to 'M' if unable to determine
  console.warn('Unable to normalize gender value:', gender, '- defaulting to M');
  return 'M';
}

export async function getPatientCalculations(patientId: string) {
  try {
    const { data, error } = await supabase
      .from('calculations')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error: any) {
    console.error('Error fetching patient calculations:', error);
    return { success: false, error: error.message };
  }
}

export async function getCalculationById(calculationId: string) {
  try {
    const { data, error } = await supabase
      .from('calculations')
      .select('*')
      .eq('id', calculationId)
      .single();
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error: any) {
    console.error('Error fetching calculation:', error);
    return { success: false, error: error.message };
  }
}
