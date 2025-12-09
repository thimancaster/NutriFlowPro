import { supabase } from "@/integrations/supabase/client";
import { validateCalculation } from "@/utils/validation/calculationValidators";

interface SaveCalculationParams {
  patient_id: string;
  user_id: string;
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
  tipo?: string;
  status?: string;
}

interface SaveResult {
  success: boolean;
  error?: string;
  data?: any;
}

/**
 * Helper to extract numeric value from potential object {value, formula}
 */
const extractNumericValue = (val: any): number => {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') return val;
  if (typeof val === 'object' && 'value' in val) return Number(val.value) || 0;
  return Number(val) || 0;
};

/**
 * Save calculation results to Supabase
 * This is the main function used by CalculatorTool and other components
 */
export const saveCalculationResults = async (data: SaveCalculationParams): Promise<SaveResult> => {
  console.log("💾 [SERVICE] saveCalculationResults called with:", data);

  try {
    // 1. Validate data
    const validation = validateCalculation(data);
    
    if (!validation.isValid) {
      const errorMessages = Object.values(validation.errors || {}).join('. ');
      console.error("❌ [SERVICE] Validation failed:", validation.errors);
      return {
        success: false,
        error: errorMessages || "Dados inválidos"
      };
    }

    // 2. Prepare payload with sanitized data
    const payload = {
      patient_id: data.patient_id,
      user_id: data.user_id,
      weight: validation.sanitizedData.weight,
      height: validation.sanitizedData.height,
      age: validation.sanitizedData.age,
      gender: validation.sanitizedData.gender,
      activity_level: validation.sanitizedData.activity_level,
      goal: validation.sanitizedData.goal,
      bmr: extractNumericValue(data.bmr),
      tdee: extractNumericValue(data.tdee),
      protein: extractNumericValue(data.protein),
      carbs: extractNumericValue(data.carbs),
      fats: extractNumericValue(data.fats),
      tipo: data.tipo || 'primeira_consulta',
      status: data.status || 'completo',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log("📤 [SERVICE] Payload prepared:", payload);

    // 3. Insert into Supabase
    const { data: savedData, error } = await supabase
      .from('calculations')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error("❌ [SERVICE] Supabase error:", error);
      return {
        success: false,
        error: error.message || "Erro ao salvar no banco de dados"
      };
    }

    console.log("✅ [SERVICE] Saved successfully:", savedData);
    return {
      success: true,
      data: savedData
    };

  } catch (error: any) {
    console.error("❌ [SERVICE] Exception:", error);
    return {
      success: false,
      error: error.message || "Erro inesperado ao salvar cálculo"
    };
  }
};

/**
 * Legacy function - kept for backward compatibility
 */
export const calculationService = {
  async saveCalculation(data: any) {
    console.log("💾 [SERVICE] Legacy saveCalculation:", data);

    try {
      if (!data.patientId) {
        throw new Error("ID do paciente é obrigatório para salvar o cálculo.");
      }

      const tmbValue = extractNumericValue(data.results?.tmb);
      const getValue = extractNumericValue(data.results?.get);
      const vetValue = extractNumericValue(data.results?.vet);

      const payload = {
        patient_id: data.patientId,
        user_id: data.userId,
        weight: Number(data.inputs?.weight) || 0,
        height: Number(data.inputs?.height) || 0,
        age: Number(data.inputs?.age) || 0,
        gender: data.inputs?.gender || 'M',
        activity_level: data.inputs?.activityLevel || 'moderado',
        goal: data.inputs?.objective || 'manutenção',
        bmr: tmbValue,
        tdee: getValue || vetValue,
        protein: extractNumericValue(data.results?.macros?.protein?.grams || data.results?.macros?.protein),
        carbs: extractNumericValue(data.results?.macros?.carbs?.grams || data.results?.macros?.carbs),
        fats: extractNumericValue(data.results?.macros?.fat?.grams || data.results?.macros?.fat),
        tipo: 'primeira_consulta',
        status: 'completo',
        notes: `Fórmula TMB: ${typeof data.results?.tmb === 'object' ? data.results.tmb.formula : 'Auto'}`
      };

      console.log("📤 [SERVICE] Legacy payload:", payload);

      const { data: savedData, error } = await supabase
        .from('calculations')
        .insert(payload)
        .select()
        .single();

      if (error) {
        console.error("❌ [SERVICE] Supabase error:", error);
        throw error;
      }

      console.log("✅ [SERVICE] Legacy save successful:", savedData);
      return savedData;

    } catch (error: any) {
      console.error("❌ [SERVICE] Legacy save failed:", error.message);
      throw error;
    }
  }
};

/**
 * Get calculation history for a patient
 */
export const getCalculationHistory = async (patientId: string) => {
  const { data, error } = await supabase
    .from('calculations')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("❌ [SERVICE] Error fetching history:", error);
    return [];
  }

  return data || [];
};
