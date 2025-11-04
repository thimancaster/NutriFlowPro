/**
 * 🛡️ CALCULATION VALIDATION & WORKFLOW GUARDS
 * 
 * Centralizes all validation logic for calculations to prevent database constraint violations
 * and ensure data consistency across the NutriFlow Pro workflow.
 */

export type ValidCalculationStatus = 'em_andamento' | 'concluida' | 'cancelada';
export type ValidGender = 'M' | 'F';

// Status validation constants based on database constraint check_status_calc
export const VALID_CALCULATION_STATUSES: ValidCalculationStatus[] = ['em_andamento', 'concluida', 'cancelada'];

// Gender validation constants based on database constraint check_gender_calc  
export const VALID_GENDERS: ValidGender[] = ['M', 'F'];

/**
 * Normalizes status values to ensure they match database constraints (check_status_calc)
 * @param status - Status value from any source
 * @returns Normalized status that matches database constraint
 */
export function normalizeCalculationStatus(status?: string): ValidCalculationStatus {
  if (!status) return 'em_andamento'; // Default status
  
  const normalizedValue = status.toString().trim().toLowerCase();
  
  // Handle completed statuses
  if (normalizedValue === 'concluida' || 
      normalizedValue === 'completo' || 
      normalizedValue === 'completed' || 
      normalizedValue === 'finalizado' ||
      normalizedValue === 'finished') {
    return 'concluida';
  }
  
  // Handle cancelled statuses  
  if (normalizedValue === 'cancelada' || 
      normalizedValue === 'canceled' || 
      normalizedValue === 'cancelled') {
    return 'cancelada';
  }
  
  // Default to 'em_andamento' for all other values including 'pending', 'draft', etc
  return 'em_andamento';
}

/**
 * Normalizes gender values to ensure they match database constraints
 * @param gender - Gender value from any source
 * @returns Normalized gender that matches database constraint
 */
export function normalizeGender(gender?: string): ValidGender {
  if (!gender) return 'M'; // Default to Male if no gender provided
  
  const normalizedValue = gender.toString().trim().toUpperCase();
  
  // Handle male variants
  if (normalizedValue === 'M' || 
      normalizedValue === 'MALE' || 
      normalizedValue === 'MASCULINO') {
    return 'M';
  }
  
  // Handle female variants
  if (normalizedValue === 'F' || 
      normalizedValue === 'FEMALE' || 
      normalizedValue === 'FEMININO') {
    return 'F';
  }
  
  // Default to 'M' if unable to determine
  console.warn('Unable to normalize gender value:', gender, '- defaulting to M');
  return 'M';
}

/**
 * Validates if the provided status is valid for calculations table
 * @param status - Status to validate
 * @returns True if valid, false otherwise
 */
export function isValidCalculationStatus(status: string): status is ValidCalculationStatus {
  return VALID_CALCULATION_STATUSES.includes(status as ValidCalculationStatus);
}

/**
 * Validates if the provided gender is valid for calculations table
 * @param gender - Gender to validate  
 * @returns True if valid, false otherwise
 */
export function isValidGender(gender: string): gender is ValidGender {
  return VALID_GENDERS.includes(gender as ValidGender);
}

/**
 * 🛡️ WORKFLOW GUARDS - Prevent invalid workflow transitions
 */

export interface PatientWorkflowValidation {
  hasPatient: boolean;
  hasBasicData: boolean;
  canCalculate: boolean;
  message?: string;
}

export interface CalculationWorkflowValidation {
  hasValidCalculation: boolean;
  canGenerateMealPlan: boolean;
  calculationStatus: ValidCalculationStatus | null;
  message?: string;
}

/**
 * Validates if patient data is sufficient for calculation workflow
 */
export function validatePatientForCalculation(patient: any): PatientWorkflowValidation {
  if (!patient) {
    return {
      hasPatient: false,
      hasBasicData: false,
      canCalculate: false,
      message: "Selecione um paciente antes de calcular."
    };
  }
  
  const hasBasicData = patient.id && patient.name && 
                       (patient.weight > 0 || patient.height > 0);
  
  if (!hasBasicData) {
    return {
      hasPatient: true,
      hasBasicData: false,
      canCalculate: false,
      message: "Complete os dados básicos do paciente (peso, altura) antes de calcular."
    };
  }
  
  return {
    hasPatient: true,
    hasBasicData: true,
    canCalculate: true
  };
}

/**
 * Validates if calculation data is sufficient for meal plan generation
 */
export function validateCalculationForMealPlan(calculation: any): CalculationWorkflowValidation {
  if (!calculation || !calculation.id) {
    return {
      hasValidCalculation: false,
      canGenerateMealPlan: false,
      calculationStatus: null,
      message: "Finalize os cálculos antes de gerar o plano alimentar."
    };
  }
  
  const status = normalizeCalculationStatus(calculation.status);
  
  if (status !== 'concluida') {
    return {
      hasValidCalculation: true,
      canGenerateMealPlan: false,
      calculationStatus: status,
      message: "Complete o cálculo nutricional antes de gerar o plano alimentar."
    };
  }
  
  // Check if has required nutritional data
  const hasNutritionalData = calculation.tdee > 0 && 
                            calculation.protein > 0 &&
                            calculation.carbs > 0 &&
                            calculation.fats > 0;
                            
  if (!hasNutritionalData) {
    return {
      hasValidCalculation: true,
      canGenerateMealPlan: false,
      calculationStatus: status,
      message: "Dados nutricionais incompletos. Recalcule os valores."
    };
  }
  
  return {
    hasValidCalculation: true,
    canGenerateMealPlan: true,
    calculationStatus: status
  };
}

/**
 * Sanitizes calculation data before database insertion
 */
export function sanitizeCalculationData(data: any) {
  const age = Number(data.age) || 0;
  
  // 🛡️ CRITICAL: Validate age > 0 (database constraint check_age_positive)
  if (age <= 0) {
    console.error('[VALIDATION] Invalid age:', data.age);
    throw new Error('Idade inválida. Por favor, forneça uma idade válida (maior que 0).');
  }
  
  return {
    ...data,
    status: normalizeCalculationStatus(data.status),
    gender: normalizeGender(data.gender),
    // Ensure numeric fields are properly typed
    weight: Number(data.weight) || 0,
    height: Number(data.height) || 0,
    age: age, // Already validated above
    bmr: Number(data.bmr) || 0,
    tdee: Number(data.tdee) || 0,
    protein: Number(data.protein) || 0,
    carbs: Number(data.carbs) || 0,
    fats: Number(data.fats) || 0,
  };
}

/**
 * Creates user-friendly error messages for calculation errors
 */
export function getCalculationErrorMessage(error: any): string {
  if (!error) return 'Erro desconhecido';
  
  const errorMessage = error.message || error.toString();
  
  // Handle specific constraint violations
  if (errorMessage.includes('check_status_calc')) {
    return 'Status de cálculo inválido. Tente novamente.';
  }
  
  if (errorMessage.includes('check_gender_calc')) {
    return 'Gênero inválido. Verifique os dados do paciente.';
  }
  
  if (errorMessage.includes('violates check constraint')) {
    return 'Dados inválidos fornecidos. Verifique as informações e tente novamente.';
  }
  
  if (errorMessage.includes('violates row-level security policy')) {
    return 'Permissão negada. Faça login novamente.';
  }
  
  if (errorMessage.includes('duplicate key')) {
    return 'Cálculo já existe para este paciente.';
  }
  
  // Generic fallback
  return 'Não foi possível salvar os cálculos. Tente novamente.';
}