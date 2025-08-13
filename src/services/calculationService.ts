import { supabase } from '@/integrations/supabase/client';

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
    
    // First, register the calculation attempt and check quota
    const { data: quotaResult, error: quotaError } = await supabase.rpc('register_calculation_attempt', {
      p_patient_id: data.patient_id,
      p_calculation_data: {
        weight: data.weight,
        height: data.height,
        age: data.age,
        gender: data.gender,
        activity_level: data.activity_level,
        goal: data.goal
      }
    });

    if (quotaError) {
      console.error('Quota check error:', quotaError);
      throw quotaError;
    }

    // Check if quota was exceeded
    if (!quotaResult.success) {
      return { 
        success: false, 
        error: quotaResult.error,
        quota_exceeded: quotaResult.quota_exceeded,
        attempts_remaining: quotaResult.attempts_remaining
      };
    }

    // If quota check passed, proceed with calculation
    const { data: calculation, error } = await supabase
      .from('calculations')
      .insert({
        ...data,
        created_at: new Date().toISOString()
      })
      .select('*')
      .single();
    
    if (error) {
      console.error('Database error saving calculation:', error);
      throw error;
    }
    
    return { 
      success: true, 
      data: calculation,
      quota_status: quotaResult
    };
  } catch (error: any) {
    console.error('Error saving calculation results:', error);
    return { success: false, error: error.message };
  }
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
