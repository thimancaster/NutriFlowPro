
import { supabase } from '@/integrations/supabase/client';
import { dbCache } from './dbCache';

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
    
    // Insert calculation record
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
    
    // Invalidate any cached calculations for this patient
    dbCache.invalidate(`${dbCache.KEYS.CONSULTATIONS}${data.patient_id}`);
    
    return { success: true, data: calculation };
  } catch (error: any) {
    console.error('Error saving calculation results:', error);
    return { success: false, error: error.message };
  }
}

export async function getPatientCalculations(patientId: string) {
  try {
    const cacheKey = `${dbCache.KEYS.CONSULTATIONS}${patientId}`;
    const cachedData = dbCache.get(cacheKey);
    
    if (cachedData) {
      console.log('Using cached calculations');
      return { success: true, data: cachedData };
    }
    
    const { data, error } = await supabase
      .from('calculations')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Cache the results
    dbCache.set(cacheKey, data);
    
    return { success: true, data };
  } catch (error: any) {
    console.error('Error fetching patient calculations:', error);
    return { success: false, error: error.message };
  }
}

export async function getCalculationById(calculationId: string) {
  try {
    const cacheKey = `${dbCache.KEYS.CONSULTATIONS}single_${calculationId}`;
    const cachedData = dbCache.get(cacheKey);
    
    if (cachedData) {
      console.log('Using cached calculation');
      return { success: true, data: cachedData };
    }
    
    const { data, error } = await supabase
      .from('calculations')
      .select('*')
      .eq('id', calculationId)
      .single();
    
    if (error) throw error;
    
    // Cache the result
    dbCache.set(cacheKey, data);
    
    return { success: true, data };
  } catch (error: any) {
    console.error('Error fetching calculation:', error);
    return { success: false, error: error.message };
  }
}
