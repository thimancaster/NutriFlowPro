
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { CalculatorState } from './types';

// Create or update a temporary patient in Supabase
export async function saveTemporaryPatient(
  state: CalculatorState,
  user: any,
  tempPatientId: string | null,
  bmr: number,
  tee: number,
  macros: { 
    carbs: number;
    protein: number;
    fat: number;
  }
): Promise<string> {
  // If we don't have a user, we can't save a patient
  if (!user || !state.patientName) {
    return tempPatientId || '';
  }
  
  try {
    // Create temporary patient ID if not already created
    const patientId = tempPatientId || uuidv4();
    
    if (!tempPatientId) {
      // Create temporary patient
      const { error } = await supabase
        .from('patients')
        .insert({
          id: patientId,
          name: state.patientName,
          gender: state.gender === 'male' ? 'male' : 'female',
          user_id: user.id,
          goals: {
            objective: state.objective
          }
        });
        
      if (error) {
        console.error("Error creating temporary patient:", error);
        return '';
      }
    }
    
    // Save the calculation
    const { error: calcError } = await supabase
      .from('calculations')
      .insert({
        user_id: user.id,
        patient_id: patientId,
        weight: parseFloat(state.weight),
        height: parseFloat(state.height),
        age: parseInt(state.age),
        bmr: bmr,
        tdee: Math.round(tee),
        protein: macros.protein,
        carbs: macros.carbs,
        fats: macros.fat,
        gender: state.gender,
        activity_level: state.activityLevel,
        goal: state.objective,
        tipo: state.consultationType || 'primeira_consulta',
        status: 'em_andamento'
      });
      
    if (calcError) {
      console.error("Error saving calculation:", calcError);
    }
    
    return patientId;
  } catch (err) {
    console.error("Error in patient pre-registration:", err);
    return tempPatientId || '';
  }
}

// Helper function to update the status of a calculation
export async function updateCalculationStatus(
  calculationId: string, 
  status: 'em_andamento' | 'concluida' | 'cancelada'
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('calculations')
      .update({ status })
      .eq('id', calculationId);
      
    if (error) {
      console.error("Error updating calculation status:", error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error("Error updating calculation status:", err);
    return false;
  }
}
