/**
 * OFFICIAL NUTRITIONAL CALCULATIONS - SINGLE SOURCE OF TRUTH
 * 
 * This is the ONLY file that should contain nutritional calculation logic.
 * All other calculation files redirect to this implementation to ensure
 * 100% consistency and audit compliance across the entire system.
 */

export type Gender = 'M' | 'F';
export type PatientProfile = 'eutrofico' | 'sobrepeso_obesidade' | 'atleta';
export type ActivityLevel = 'sedentario' | 'leve' | 'moderado' | 'intenso' | 'muito_intenso';
export type Objective = 'emagrecimento' | 'manutenção' | 'hipertrofia' | 'personalizado';

// [PHASE 3] TMB Formula Types - Extended with new formulas
export type TmbFormula = 
  | 'harris_benedict'
  | 'mifflin_st_jeor' 
  | 'tinsley'
  | 'katch_mcardle'
  | 'cunningham'
  | 'oms_fao_unu'
  | 'penn_state';

// FORMULA METADATA FOR DYNAMIC UI (Ground Truth) - EXPANDED PHASE 3
export const AVAILABLE_FORMULAS = [
  {
    value: 'harris_benedict',
    label: 'Harris-Benedict Revisada (1984)',
    description: 'Para pacientes eutróficos',
    requiresHeight: true,
    requiresAge: true,
    requiresLeanMass: false,
    profile: 'eutrofico' as PatientProfile
  },
  {
    value: 'mifflin_st_jeor', 
    label: 'Mifflin-St Jeor (1990)',
    description: 'Para sobrepeso/obesidade (mais precisa)',
    requiresHeight: true,
    requiresAge: true,
    requiresLeanMass: false,
    profile: 'sobrepeso_obesidade' as PatientProfile
  },
  {
    value: 'tinsley',
    label: 'Tinsley (2019)', 
    description: 'Para atletas/alta massa muscular',
    requiresHeight: false,
    requiresAge: false,
    requiresLeanMass: false,
    profile: 'atleta' as PatientProfile
  },
  {
    value: 'katch_mcardle',
    label: 'Katch-McArdle',
    description: 'Baseada em massa magra (composição corporal)',
    requiresHeight: false,
    requiresAge: false,
    requiresLeanMass: true,
    profile: null
  },
  {
    value: 'cunningham',
    label: 'Cunningham (1980)',
    description: 'Para atletas com massa magra conhecida',
    requiresHeight: false,
    requiresAge: false,
    requiresLeanMass: true,
    profile: 'atleta' as PatientProfile
  },
  {
    value: 'oms_fao_unu',
    label: 'OMS/FAO/UNU (1985)',
    description: 'Recomendação internacional padrão',
    requiresHeight: false,
    requiresAge: true,
    requiresLeanMass: false,
    profile: null
  },
  {
    value: 'penn_state',
    label: 'Penn State (2003)',
    description: 'Para pacientes obesos/críticos',
    requiresHeight: false,
    requiresAge: false,
    requiresLeanMass: false,
    profile: 'sobrepeso_obesidade' as PatientProfile
  }
] as const;

// OFFICIAL ACTIVITY FACTORS - FIXED VALUES (Ground Truth)
export const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentario: 1.2,
  leve: 1.375,
  moderado: 1.55,
  intenso: 1.725,
  muito_intenso: 1.9
} as const;

// OFFICIAL CALORIC VALUES PER GRAM (Ground Truth)
export const CALORIC_VALUES = {
  protein: 4, // kcal/g
  carbs: 4,   // kcal/g
  fat: 9      // kcal/g
} as const;

// OFFICIAL OBJECTIVE ADJUSTMENTS (Ground Truth)
export const OBJECTIVE_ADJUSTMENTS: Record<Exclude<Objective, 'personalizado'>, number> = {
  emagrecimento: -500,  // Deficit for weight loss
  manutenção: 0,        // No adjustment for maintenance
  hipertrofia: 400      // Surplus for hypertrophy
} as const;

/**
 * HARRIS-BENEDICT REVISADA (1984) - For Eutrophic Patients
 * Source: Roza and Shizgal (1984)
 * SSOT: NUTRIFLOW_PRO_SPEC_V2.0.md Section 2.1
 * 
 * CORRECTED COEFFICIENTS (exact precision required for clinical accuracy)
 */
export function calculateTMB_HarrisBenedict(
  weight: number,
  height: number, 
  age: number,
  gender: Gender
): number {
  if (gender === 'M') {
    // Men: TMB = 66.5 + (13.75 × weight) + (5.003 × height) – (6.75 × age)
    const tmb = 66.5 + (13.75 * weight) + (5.003 * height) - (6.75 * age);
    console.log(`[TMB-HB] Homem: 66.5 + (13.75×${weight}) + (5.003×${height}) - (6.75×${age}) = ${tmb.toFixed(1)} kcal`);
    return tmb;
  } else {
    // Women: TMB = 655.1 + (9.563 × weight) + (1.850 × height) – (4.676 × age)
    const tmb = 655.1 + (9.563 * weight) + (1.850 * height) - (4.676 * age);
    console.log(`[TMB-HB] Mulher: 655.1 + (9.563×${weight}) + (1.850×${height}) - (4.676×${age}) = ${tmb.toFixed(1)} kcal`);
    return tmb;
  }
}

/**
 * MIFFLIN-ST JEOR EQUATION - For Overweight/Obesity Patients
 * More accurate for overweight patients as per audit specifications
 */
export function calculateTMB_MifflinStJeor(
  weight: number,
  height: number,
  age: number, 
  gender: Gender
): number {
  if (gender === 'M') {
    return (10 * weight) + (6.25 * height) - (5 * age) + 5;
  } else {
    return (10 * weight) + (6.25 * height) - (5 * age) - 161;
  }
}

/**
 * TINSLEY EQUATION - For Athletes
 * Weight-only formula, same for men and women as per audit
 */
export function calculateTMB_Tinsley(weight: number): number {
  // Tinsley formula: TMB = 24.8 × weight + 10 (verified athletic formula)
  const tmb = 24.8 * weight + 10;
  console.log(`[TMB-Tinsley] ${weight}kg → TMB = ${tmb.toFixed(1)} kcal`);
  return tmb;
}

/**
 * [PHASE 3] KATCH-MCARDLE EQUATION - Based on Lean Body Mass
 * Most accurate when body composition is known
 * Same formula for men and women (gender-neutral)
 * Reference: Katch & McArdle (1996)
 */
export function calculateTMB_KatchMcArdle(leanBodyMass: number): number {
  if (leanBodyMass <= 0) {
    throw new Error('Lean body mass must be greater than zero');
  }
  // Formula: TMB = 370 + (21.6 × lean body mass in kg)
  const tmb = 370 + (21.6 * leanBodyMass);
  console.log(`[TMB-Katch] Massa Magra ${leanBodyMass.toFixed(1)}kg → TMB = ${tmb.toFixed(1)} kcal`);
  return tmb;
}

/**
 * [PHASE 3] CUNNINGHAM EQUATION - For Athletes with Known LBM
 * Designed specifically for athletes and active individuals
 * Reference: Cunningham (1980)
 */
export function calculateTMB_Cunningham(leanBodyMass: number): number {
  if (leanBodyMass <= 0) {
    throw new Error('Lean body mass must be greater than zero');
  }
  // Formula: TMB = 500 + (22 × lean body mass in kg)
  const tmb = 500 + (22 * leanBodyMass);
  console.log(`[TMB-Cunningham] Massa Magra ${leanBodyMass.toFixed(1)}kg → TMB = ${tmb.toFixed(1)} kcal`);
  return tmb;
}

/**
 * [PHASE 3] OMS/FAO/UNU EQUATIONS (1985) - International Standard
 * WHO/FAO/UNU recommended equations by age group
 * Reference: Energy and protein requirements (1985)
 */
export function calculateTMB_OMS_FAO_UNU(
  weight: number,
  age: number,
  gender: Gender
): number {
  let tmb: number;
  
  if (gender === 'M') {
    // Men
    if (age >= 18 && age <= 30) {
      tmb = (15.3 * weight) + 679;
    } else if (age >= 31 && age <= 60) {
      tmb = (11.6 * weight) + 879;
    } else if (age > 60) {
      tmb = (13.5 * weight) + 487;
    } else {
      // < 18 years (adolescents 10-18)
      tmb = (17.5 * weight) + 651;
    }
  } else {
    // Women
    if (age >= 18 && age <= 30) {
      tmb = (14.7 * weight) + 496;
    } else if (age >= 31 && age <= 60) {
      tmb = (8.7 * weight) + 829;
    } else if (age > 60) {
      tmb = (10.5 * weight) + 596;
    } else {
      // < 18 years (adolescents 10-18)
      tmb = (12.2 * weight) + 746;
    }
  }
  
  console.log(`[TMB-OMS] ${gender}, ${age}anos, ${weight}kg → TMB = ${tmb.toFixed(1)} kcal`);
  return tmb;
}

/**
 * [PHASE 3] PENN STATE EQUATION (2003) - For Obese/Critical Patients
 * More accurate for obese and critically ill patients
 * Reference: Frankenfield et al. (2003)
 * Note: This is a simplified version using only weight
 */
export function calculateTMB_PennState(
  weight: number,
  age: number,
  gender: Gender
): number {
  // Simplified Penn State using Mifflin as base with obesity correction
  // Full Penn State requires minute ventilation and max temp (ICU parameters)
  // This version applies obesity-adjusted coefficients
  let tmb: number;
  
  if (gender === 'M') {
    tmb = (10 * weight) - (5 * age) + 5;
  } else {
    tmb = (10 * weight) - (5 * age) - 161;
  }
  
  // Apply Penn State obesity correction factor (1.15)
  tmb = tmb * 1.15;
  
  console.log(`[TMB-PennState] ${gender}, ${age}anos, ${weight}kg → TMB = ${tmb.toFixed(1)} kcal (com correção obesidade)`);
  return tmb;
}

/**
 * [UPDATED PHASE 3] TMB CALCULATION WITH AUTOMATIC OR MANUAL FORMULA SELECTION
 * Supports both automatic (profile-based) and manual formula selection
 * Now supports lean body mass for advanced formulas
 */
export function calculateTMB_Official(
  weight: number,
  height: number,
  age: number,
  gender: Gender,
  profile: PatientProfile,
  manualFormula?: TmbFormula,
  leanBodyMass?: number
): { value: number; formula: string; formulaCode: TmbFormula } {
  let tmb: number;
  let formula: string;
  let formulaCode: TmbFormula;

  // PRIORITY 1: Manual formula selection (if provided)
  if (manualFormula) {
    console.log(`[TMB] 🎯 Using MANUAL formula: ${manualFormula}`);
    
    switch (manualFormula) {
      case 'harris_benedict':
        tmb = calculateTMB_HarrisBenedict(weight, height, age, gender);
        formula = 'Harris-Benedict Revisada (1984)';
        formulaCode = 'harris_benedict';
        break;
        
      case 'mifflin_st_jeor':
        tmb = calculateTMB_MifflinStJeor(weight, height, age, gender);
        formula = 'Mifflin-St Jeor (1990)';
        formulaCode = 'mifflin_st_jeor';
        break;
        
      case 'tinsley':
        tmb = calculateTMB_Tinsley(weight);
        formula = 'Tinsley (2019)';
        formulaCode = 'tinsley';
        break;
        
      case 'katch_mcardle':
        if (!leanBodyMass) {
          throw new Error('Katch-McArdle requires lean body mass (LBM)');
        }
        tmb = calculateTMB_KatchMcArdle(leanBodyMass);
        formula = 'Katch-McArdle (LBM-based)';
        formulaCode = 'katch_mcardle';
        break;
        
      case 'cunningham':
        if (!leanBodyMass) {
          throw new Error('Cunningham requires lean body mass (LBM)');
        }
        tmb = calculateTMB_Cunningham(leanBodyMass);
        formula = 'Cunningham (1980) - Athletes';
        formulaCode = 'cunningham';
        break;
        
      case 'oms_fao_unu':
        tmb = calculateTMB_OMS_FAO_UNU(weight, age, gender);
        formula = 'OMS/FAO/UNU (1985)';
        formulaCode = 'oms_fao_unu';
        break;
        
      case 'penn_state':
        tmb = calculateTMB_PennState(weight, age, gender);
        formula = 'Penn State (2003) - Obesity';
        formulaCode = 'penn_state';
        break;
        
      default:
        tmb = calculateTMB_HarrisBenedict(weight, height, age, gender);
        formula = 'Harris-Benedict (Fallback)';
        formulaCode = 'harris_benedict';
    }
  } 
  // PRIORITY 2: Automatic selection based on profile (legacy behavior)
  else {
    console.log(`[TMB] ✅ Using AUTOMATIC formula for profile: ${profile}`);
    
    switch (profile) {
      case 'eutrofico':
        tmb = calculateTMB_HarrisBenedict(weight, height, age, gender);
        formula = 'Harris-Benedict (Auto: Eutrophic)';
        formulaCode = 'harris_benedict';
        break;
        
      case 'sobrepeso_obesidade':
        tmb = calculateTMB_MifflinStJeor(weight, height, age, gender);
        formula = 'Mifflin-St Jeor (Auto: Overweight/Obesity)';
        formulaCode = 'mifflin_st_jeor';
        break;
        
      case 'atleta':
        tmb = calculateTMB_Tinsley(weight);
        formula = 'Tinsley (Auto: Athlete)';
        formulaCode = 'tinsley';
        break;
        
      default:
        tmb = calculateTMB_HarrisBenedict(weight, height, age, gender);
        formula = 'Harris-Benedict (Auto: Default)';
        formulaCode = 'harris_benedict';
    }
  }

  const roundedTmb = Math.round(tmb);
  console.log(`[TMB] 🎯 FINAL: ${roundedTmb} kcal using ${formula}`);

  return {
    value: roundedTmb,
    formula,
    formulaCode
  };
}

/**
 * GET CALCULATION - TMB × Activity Factor (Ground Truth)
 * UPDATED: Now uses profile-differentiated activity factors (SSOT V2.0)
 * Priority: 1) Manual F.A., 2) Profile-based F.A., 3) Supabase, 4) Hardcoded fallback
 */
export async function calculateGET_Official(
  tmb: number, 
  activityLevel: ActivityLevel,
  manualFactor?: number,
  profile?: PatientProfile,
  gender?: Gender
): Promise<number> {
  let activityFactor: number;
  
  // PRIORITY 1: Manual input (highest priority)
  if (manualFactor !== undefined && manualFactor > 0) {
    activityFactor = manualFactor;
    console.log('[GET] 🎯 Using manual F.A.:', activityFactor);
  } 
  // PRIORITY 2: Profile-differentiated factors (NEW - SSOT V2.0)
  else if (profile) {
    const { getActivityFactor } = await import('@/types/consultation');
    activityFactor = getActivityFactor(activityLevel, profile);
    console.log(`[GET] ✅ Using profile-based F.A.: ${activityFactor} (Profile: ${profile}, Level: ${activityLevel})`);
  }
  // PRIORITY 3: Supabase (requires dynamic import to avoid circular dependency)
  else if (gender) {
    try {
      const { getParametrosGETPlanilha } = await import('@/integrations/supabase/functions');
      const supabaseData = await getParametrosGETPlanilha(profile || 'eutrofico', gender);
      
      if (supabaseData?.fa_valor) {
        activityFactor = supabaseData.fa_valor;
        console.log('[GET] 📊 Using Supabase F.A.:', activityFactor);
      } else {
        // PRIORITY 4: Fallback to hardcoded
        activityFactor = ACTIVITY_FACTORS[activityLevel];
        console.log('[GET] ⚠️ Supabase returned null, using fallback F.A.:', activityFactor);
      }
    } catch (error) {
      console.error('[GET] ❌ Error fetching from Supabase, using fallback:', error);
      activityFactor = ACTIVITY_FACTORS[activityLevel];
    }
  } 
  // PRIORITY 4: Fallback
  else {
    activityFactor = ACTIVITY_FACTORS[activityLevel];
    console.log('[GET] ⚠️ Using fallback F.A.:', activityFactor);
  }
  
  const get = Math.round(tmb * activityFactor);
  console.log(`[GET] 🎯 FINAL: TMB ${tmb} × F.A. ${activityFactor} = ${get} kcal`);
  return get;
}

/**
 * VET CALCULATION - GET with Objective Adjustment (Ground Truth)
 * Applies caloric surplus/deficit based on objective
 */
export function calculateVET_Official(get: number, objective: Objective, customAdjustment?: number): number {
  if (objective === 'personalizado' && customAdjustment !== undefined) {
    return Math.round(get + customAdjustment); // Use user's custom adjustment
  }
  
  const adjustment = OBJECTIVE_ADJUSTMENTS[objective as Exclude<Objective, 'personalizado'>];
  const vet = get + adjustment;
  
  // Safety check: prevent VET from going below 1200 kcal for weight loss
  if (objective === 'emagrecimento' && vet < 1200) {
    console.warn('VET adjusted to minimum safe level (1200 kcal) for weight loss');
    return 1200;
  }
  
  return Math.round(vet);
}

/**
 * MANUAL MACRO INPUT INTERFACE
 * Allows users to manually input protein and fat g/kg as specified
 */
export interface ManualMacroInputs {
  proteinPerKg: number; // User-defined g/kg
  fatPerKg: number;     // User-defined g/kg
}

/**
 * PERCENTAGE MACRO INPUT INTERFACE (Alternative input method)
 */
export interface PercentageMacroInputs {
  proteinPercent: number; // User-defined percentage
  fatPercent: number;     // User-defined percentage
  carbsPercent?: number;  // Optional - will auto-calculate if not provided
}

export interface MacroResult {
  protein: { grams: number; kcal: number; percentage: number };
  carbs: { grams: number; kcal: number; percentage: number };
  fat: { grams: number; kcal: number; percentage: number };
}

/**
 * MACRONUTRIENT CALCULATION - OFFICIAL METHOD (g/kg input)
 * User inputs protein and fat g/kg manually
 * Carbohydrates calculated automatically as leftover energy (Ground Truth)
 */
export function calculateMacros_ByGramsPerKg(
  vet: number,
  weight: number,
  macroInputs: ManualMacroInputs
): MacroResult {
  // 1. Calculate protein (user input × weight)
  const proteinGrams = macroInputs.proteinPerKg * weight;
  const proteinKcal = proteinGrams * CALORIC_VALUES.protein;
  
  // 2. Calculate fat (user input × weight)  
  const fatGrams = macroInputs.fatPerKg * weight;
  const fatKcal = fatGrams * CALORIC_VALUES.fat;
  
  // 3. Calculate carbohydrates BY DIFFERENCE (automatic - Ground Truth)
  const carbsKcal = Math.max(0, vet - proteinKcal - fatKcal);
  const carbsGrams = carbsKcal / CALORIC_VALUES.carbs;
  
  // Calculate percentages
  const proteinPercentage = (proteinKcal / vet) * 100;
  const fatPercentage = (fatKcal / vet) * 100;
  const carbsPercentage = (carbsKcal / vet) * 100;
  
  return {
    protein: {
      grams: Math.round(proteinGrams * 10) / 10,
      kcal: Math.round(proteinKcal),
      percentage: Math.round(proteinPercentage * 10) / 10
    },
    carbs: {
      grams: Math.round(carbsGrams * 10) / 10,
      kcal: Math.round(carbsKcal),
      percentage: Math.round(carbsPercentage * 10) / 10
    },
    fat: {
      grams: Math.round(fatGrams * 10) / 10,
      kcal: Math.round(fatKcal),
      percentage: Math.round(fatPercentage * 10) / 10
    }
  };
}

/**
 * MACRONUTRIENT CALCULATION - BY PERCENTAGES (Alternative method)
 * User inputs percentages, carbs auto-calculated if not summing to 100%
 */
export function calculateMacros_ByPercentages(
  vet: number,
  weight: number,
  percentages: PercentageMacroInputs
): MacroResult {
  let { proteinPercent, fatPercent, carbsPercent } = percentages;
  
  // Auto-calculate carbs if not provided or if total doesn't equal 100%
  if (!carbsPercent || Math.abs(proteinPercent + fatPercent + carbsPercent - 100) > 0.01) {
    carbsPercent = 100 - proteinPercent - fatPercent;
  }
  
  // Validate percentages
  if (carbsPercent < 0) {
    throw new Error('Protein and fat percentages too high - no room for carbohydrates');
  }
  
  // Calculate kcal for each macro
  const proteinKcal = (vet * proteinPercent) / 100;
  const fatKcal = (vet * fatPercent) / 100;
  const carbsKcal = (vet * carbsPercent) / 100;
  
  // Calculate grams
  const proteinGrams = proteinKcal / CALORIC_VALUES.protein;
  const fatGrams = fatKcal / CALORIC_VALUES.fat;
  const carbsGrams = carbsKcal / CALORIC_VALUES.carbs;
  
  return {
    protein: {
      grams: Math.round(proteinGrams * 10) / 10,
      kcal: Math.round(proteinKcal),
      percentage: Math.round(proteinPercent * 10) / 10
    },
    carbs: {
      grams: Math.round(carbsGrams * 10) / 10,
      kcal: Math.round(carbsKcal),
      percentage: Math.round(carbsPercent * 10) / 10
    },
    fat: {
      grams: Math.round(fatGrams * 10) / 10,
      kcal: Math.round(fatKcal),
      percentage: Math.round(fatPercent * 10) / 10
    }
  };
}

/**
 * MEAL DISTRIBUTION VALIDATION
 * Ensures meal percentages always sum to 100% (Ground Truth)
 */
export function validateMealDistribution(distribution: Record<string, number>): {
  isValid: boolean;
  total: number;
  error?: string;
} {
  const total = Object.values(distribution).reduce((sum, percent) => sum + percent, 0);
  const isValid = Math.abs(total - 100) < 0.01; // Allow tiny floating point errors
  
  return {
    isValid,
    total: Math.round(total * 100) / 100,
    error: isValid ? undefined : `Meal distribution totals ${total}%, must equal 100%`
  };
}

/**
 * COMPLETE CALCULATION PIPELINE - OFFICIAL WORKFLOW (Ground Truth)
 * Follows exact sequence: TMB → FA → GET → VET → Macros
 */
export interface CalculationInputs {
  weight: number;
  height: number;
  age: number;
  gender: Gender;
  profile: PatientProfile;
  activityLevel: ActivityLevel;
  objective: Objective;
  customAdjustment?: number; // For personalizado objective
  manualActivityFactor?: number; // Manual F.A. input (PRIORITY 1)
  manualTmbFormula?: TmbFormula; // [PHASE 3] Manual TMB formula selection
  leanBodyMass?: number; // [PHASE 3] For formulas requiring LBM (Katch, Cunningham)
  // One of these macro input methods:
  macroInputs?: ManualMacroInputs;      // g/kg method
  percentageInputs?: PercentageMacroInputs; // percentage method
}

export interface CalculationResult {
  tmb: { value: number; formula: string; formulaCode: TmbFormula };
  get: number;
  vet: number;
  macros: MacroResult;
  proteinPerKg?: number;
  fatPerKg?: number;
  calculationOrder: string[];
  inputMethod: 'grams_per_kg' | 'percentages';
}

export async function calculateComplete_Official(inputs: CalculationInputs): Promise<CalculationResult> {
  // Validation
  if (inputs.weight <= 0 || inputs.height <= 0 || inputs.age <= 0) {
    throw new Error('Weight, height, and age must be greater than zero');
  }
  
  // Validate macro inputs
  const hasGramsPerKg = inputs.macroInputs && 
    inputs.macroInputs.proteinPerKg > 0 && 
    inputs.macroInputs.fatPerKg > 0;
    
  const hasPercentages = inputs.percentageInputs && 
    inputs.percentageInputs.proteinPercent > 0 && 
    inputs.percentageInputs.fatPercent > 0;
    
  if (!hasGramsPerKg && !hasPercentages) {
    throw new Error('Either macroInputs (g/kg) or percentageInputs must be provided');
  }

  // Step 1: Calculate TMB with automatic OR manual formula selection
  const tmb = calculateTMB_Official(
    inputs.weight, 
    inputs.height, 
    inputs.age, 
    inputs.gender, 
    inputs.profile,
    inputs.manualTmbFormula, // PHASE 3: Optional manual formula
    inputs.leanBodyMass      // PHASE 3: Optional LBM for Katch/Cunningham
  );
  
  // Step 2: Apply Activity Factor → GET (with priority logic)
  const get = await calculateGET_Official(
    tmb.value, 
    inputs.activityLevel,
    inputs.manualActivityFactor,
    inputs.profile,
    inputs.gender
  );
  
  // Step 3: Apply Objective Adjustment → VET
  const vet = calculateVET_Official(get, inputs.objective, inputs.customAdjustment);
  
  // Step 4: Calculate Macronutrients (method depends on input type)
  let macros: MacroResult;
  let inputMethod: 'grams_per_kg' | 'percentages';
  let proteinPerKg: number | undefined;
  let fatPerKg: number | undefined;
  
  if (hasGramsPerKg) {
    macros = calculateMacros_ByGramsPerKg(vet, inputs.weight, inputs.macroInputs!);
    inputMethod = 'grams_per_kg';
    proteinPerKg = inputs.macroInputs!.proteinPerKg;
    fatPerKg = inputs.macroInputs!.fatPerKg;
  } else {
    macros = calculateMacros_ByPercentages(vet, inputs.weight, inputs.percentageInputs!);
    inputMethod = 'percentages';
    proteinPerKg = macros.protein.grams / inputs.weight;
    fatPerKg = macros.fat.grams / inputs.weight;
  }
  
  // Verify consistency (total macro kcal should equal VET)
  const totalMacroKcal = macros.protein.kcal + macros.carbs.kcal + macros.fat.kcal;
  if (Math.abs(totalMacroKcal - vet) > 2) { // Allow small rounding differences
    console.warn(`Macro total (${totalMacroKcal}) doesn't closely match VET (${vet})`);
  }
  
  return {
    tmb,
    get,
    vet,
    macros,
    proteinPerKg,
    fatPerKg,
    inputMethod,
    calculationOrder: [
      `1. TMB calculated using ${tmb.formula}`,
      `2. GET = TMB × Activity Factor (${ACTIVITY_FACTORS[inputs.activityLevel]})`,
      `3. VET = GET with objective adjustment (${inputs.objective})`,
      `4. Macros calculated by ${inputMethod === 'grams_per_kg' ? 'g/kg input' : 'percentage input'}`
    ]
  };
}

/**
 * INPUT VALIDATION FUNCTIONS
 */
export function validateCalculationInputs(inputs: Partial<CalculationInputs>): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Basic anthropometric validation
  if (!inputs.weight || inputs.weight <= 0) {
    errors.push('Peso é obrigatório e deve ser maior que zero');
  } else if (inputs.weight < 30) {
    warnings.push('Peso muito baixo - verificar dados');
  } else if (inputs.weight > 300) {
    warnings.push('Peso muito alto - verificar dados');
  }

  if (!inputs.height || inputs.height <= 0) {
    errors.push('Altura é obrigatória e deve ser maior que zero');
  } else if (inputs.height < 100) {
    warnings.push('Altura muito baixa - verificar se está em cm');
  } else if (inputs.height > 250) {
    warnings.push('Altura muito alta - verificar dados');
  }

  if (!inputs.age || inputs.age <= 0) {
    errors.push('Idade é obrigatória e deve ser maior que zero');
  } else if (inputs.age < 18) {
    warnings.push('Paciente menor de idade - considerar necessidades especiais');
  } else if (inputs.age > 100) {
    warnings.push('Paciente muito idoso - considerar fatores especiais');
  }

  // Categorical validation
  if (!inputs.gender || !['M', 'F'].includes(inputs.gender)) {
    errors.push('Sexo deve ser M ou F');
  }

  if (!inputs.profile) {
    errors.push('Perfil corporal é obrigatório');
  }

  if (!inputs.activityLevel) {
    errors.push('Nível de atividade é obrigatório');
  }

  if (!inputs.objective) {
    errors.push('Objetivo é obrigatório');
  }

  // Macro input validation
  const hasGramsPerKg = inputs.macroInputs?.proteinPerKg && inputs.macroInputs?.fatPerKg;
  const hasPercentages = inputs.percentageInputs?.proteinPercent && inputs.percentageInputs?.fatPercent;

  if (!hasGramsPerKg && !hasPercentages) {
    errors.push('Deve ser fornecido entrada de macros (g/kg ou percentuais)');
  }

  if (hasGramsPerKg) {
    if (inputs.macroInputs!.proteinPerKg > 5) {
      warnings.push('Proteína muito alta (>5g/kg) - verificar adequação');
    }
    if (inputs.macroInputs!.fatPerKg > 3) {
      warnings.push('Gordura muito alta (>3g/kg) - verificar adequação');
    }
  }

  if (hasPercentages) {
    const total = inputs.percentageInputs!.proteinPercent + inputs.percentageInputs!.fatPercent + (inputs.percentageInputs!.carbsPercent || 0);
    if (inputs.percentageInputs!.carbsPercent && Math.abs(total - 100) > 1) {
      warnings.push('Soma dos percentuais não resulta em 100%');
    }
  }

  // BMI validation if both weight and height available
  if (inputs.weight && inputs.height) {
    const bmi = inputs.weight / Math.pow(inputs.height / 100, 2);
    if (bmi < 16) {
      warnings.push('IMC muito baixo (<16) - considerar necessidades especiais');
    } else if (bmi > 40) {
      warnings.push('IMC muito alto (>40) - considerar necessidades especiais');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}