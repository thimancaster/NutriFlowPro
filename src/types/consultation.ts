import { GERFormula } from './gerFormulas';

// Sex types
export type Sex = 'M' | 'F';

// Activity levels
export type ActivityLevel = 'sedentario' | 'leve' | 'moderado' | 'intenso' | 'muito_intenso';

// Objectives
export type Objective = 'emagrecimento' | 'manutenção' | 'hipertrofia' | 'personalizado';

// Profile types - CORRIGIDO PARA COMPATIBILIDADE
export type Profile = 'eutrofico' | 'sobrepeso_obesidade' | 'atleta';

// Consultation types
export type ConsultationType = 'primeira_consulta' | 'retorno';

// Consultation status
export type ConsultationStatus = 'em_andamento' | 'completo';

// [UPDATED] Activity factors differentiated by profile - SSOT V2.0
// Fatores de Atividade agora diferenciados para Eutróficos vs Obesos/Sobrepeso
export function getActivityFactor(
  level: ActivityLevel, 
  profile: Profile
): number {
  const FACTORS_BY_PROFILE: Record<Profile, Record<ActivityLevel, number>> = {
    eutrofico: {
      sedentario: 1.20,
      leve: 1.375,
      moderado: 1.55,
      intenso: 1.725,
      muito_intenso: 1.90
    },
    sobrepeso_obesidade: {
      sedentario: 1.30,
      leve: 1.50,
      moderado: 1.60,
      intenso: 1.80,
      muito_intenso: 2.00
    },
    atleta: {
      sedentario: 1.20,
      leve: 1.375,
      moderado: 1.55,
      intenso: 1.725,
      muito_intenso: 1.90
    }
  };
  
  const factor = FACTORS_BY_PROFILE[profile][level];
  console.log(`[FA] Perfil: ${profile}, Nível: ${level} → F.A. = ${factor}`);
  return factor;
}

// [DEPRECATED] Mantido para compatibilidade temporária - Use getActivityFactor() instead
export const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentario: 1.2,
  leve: 1.375,
  moderado: 1.55,
  intenso: 1.725,
  muito_intenso: 1.9
};

// Objective adjustment factors - EXATOS DA PLANILHA (convertidos para fatores multiplicativos)
export const OBJECTIVE_FACTORS: Record<Objective, number> = {
  emagrecimento: 0.8,    // DEPRECATED: Use motor centralizado que aplica -500 kcal
  manutenção: 1.0,       
  hipertrofia: 1.15,     // DEPRECATED: Use motor centralizado que aplica +400 kcal
  personalizado: 1.0     
};

// Nutrition constants - CORRIGIDOS CONFORME PLANILHA CENTRAL
// [UPDATED] Proteína corrigida para valores exatos da planilha
export const PROTEIN_RATIOS: Record<Profile, number> = {
  eutrofico: 1.8,              // CORRIGIDO: era 1.2, agora 1.8 g/kg conforme planilha
  sobrepeso_obesidade: 2.0,    // CORRETO: já estava 2.0 g/kg conforme planilha
  atleta: 2.2                  // CORRIGIDO: era 1.8, agora 2.2 g/kg conforme planilha
};

// [OFFICIAL] Lipídios por perfil (g/kg) - SSOT V2.0
export const LIPID_RATIOS: Record<Profile, number> = {
  eutrofico: 0.8,              // ✅ OFICIAL: 0.8 g/kg conforme NUTRIFLOW_PRO_SPEC_V2.0.md
  sobrepeso_obesidade: 0.5,    // ✅ OFICIAL: 0.5 g/kg conforme NUTRIFLOW_PRO_SPEC_V2.0.md
  atleta: 1.0                  // ✅ OFICIAL: 1.0 g/kg conforme NUTRIFLOW_PRO_SPEC_V2.0.md
};

// Valores calóricos por grama de macronutriente - PADRÃO INTERNACIONAL (CORRETO)
export const CALORIE_VALUES = {
  protein: 4,  // kcal/g
  carbs: 4,    // kcal/g
  fat: 9       // kcal/g
};

// [NEW] Constantes adicionais da planilha
export const PLANILHA_ADJUSTMENTS = {
  MIN_CALORIES_WEIGHT_LOSS: 1200,  // Mínimo para emagrecimento
  EMAGRECIMENTO_DEFICIT: -500,      // Déficit calórico
  HIPERTROFIA_SURPLUS: 400,         // Superávit calórico
  DEFAULT_FAT_PERCENTAGE: 0.25      // 25% do GET para gorduras
};

// Form state interface - UPDATED to include GER formula
export interface ConsultationFormState {
  weight: string;
  height: string;
  age: string;
  sex: Sex;
  objective: Objective;
  profile: Profile;
  activityLevel: ActivityLevel;
  consultationType: ConsultationType;
  consultationStatus: ConsultationStatus;
  gerFormula?: GERFormula; // NEW: Selected GER formula
  bodyFatPercentage?: string; // NEW: For formulas that require body fat
}

// Results interface
export interface ConsultationResults {
  tmb: number;
  fa: number;
  get: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
}

// Main consultation data interface - UPDATED to include GER formula
export interface ConsultationData {
  id?: string;
  patient_id?: string;
  user_id?: string;
  patient?: any;
  age?: number;
  weight?: number;
  height?: number;
  gender?: string;
  activity_level?: string;
  objective?: string;
  goal?: string;
  bmr?: number;
  tdee?: number;
  totalCalories: number; // REQUIRED
  protein: number;
  carbs: number;
  fats: number;
  created_at?: string;
  updated_at?: string;
  notes?: string;
  date?: string;
  appointment_id?: string;
  recommendations?: string;
  gerFormula?: GERFormula; // NEW: Selected GER formula
  gerFormulaName?: string; // NEW: Name of the formula used
  bodyFatPercentage?: number; // NEW: For formulas that require body fat
  results?: {
    bmr: number;
    get: number;
    vet: number;
    adjustment: number;
    macros: {
      protein: number;
      carbs: number;
      fat: number;
    };
    gerFormula?: GERFormula; // NEW: Formula used in calculation
    gerFormulaName?: string; // NEW: Name of the formula used
  };
}

// Result type for consultation operations
export interface ConsultationResult {
  bmr: number;
  get: number;
  vet: number;
  adjustment: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
}
