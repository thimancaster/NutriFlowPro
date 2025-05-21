
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
}

export async function saveCalculationResults(data: CalculationData) {
  try {
    // Insert calculation record
    const { data: calculation, error } = await supabase
      .from('calculations')
      .insert({
        ...data,
        created_at: new Date().toISOString()
      })
      .select('*')
      .single();
    
    if (error) throw error;
    
    return { success: true, data: calculation };
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
