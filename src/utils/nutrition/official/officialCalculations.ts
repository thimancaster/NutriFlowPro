// src/utils/nutrition/official/officialCalculations.ts
// ========== MOTOR OFICIAL DE CÁLCULOS ==========

export interface PatientData {
  weight: number;
  height: number;
  age: number;
  gender: 'male' | 'female';
  activityLevel: ActivityLevel;
}

export interface MacroConfig {
  type: 'percentage' | 'grams_per_kg';
  protein: number;
  carbs: number;
  fat: number;
}

export interface CalculationResult {
  tmb: number;
  get: number;
  vet: number;
  macros: {
    protein: { grams: number; calories: number; percentage: number };
    carbs: { grams: number; calories: number; percentage: number };
    fat: { grams: number; calories: number; percentage: number };
  };
  formula: TMBFormula;
  activityFactor: number;
  energyAdjustment: number;
}

export type TMBFormula = 'harris-benedict' | 'mifflin-st-jeor' | 'tinsley';
export type ActivityLevel =
  | 'sedentary'
  | 'lightly-active'
  | 'moderately-active'
  | 'very-active'
  | 'extremely-active';

const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  'sedentary': 1.2,
  'lightly-active': 1.375,
  'moderately-active': 1.55,
  'very-active': 1.725,
  'extremely-active': 1.9,
};

const MACRO_CALORIES_PER_GRAM = { protein: 4, carbs: 4, fat: 9 };

// ===== Fórmulas TMB =====
function calculateTMBHarrisBenedict(w: number, h: number, a: number, g: 'male'|'female') {
  return g === 'male'
    ? 66 + (13.7*w) + (5*h) - (6.8*a)
    : 655 + (9.6*w) + (1.8*h) - (4.7*a);
}
function calculateTMBMifflinStJeor(w: number, h: number, a: number, g: 'male'|'female') {
  const base = (10*w) + (6.25*h) - (5*a);
  return g === 'male' ? base+5 : base-161;
}
function calculateTMBTinsley(w: number, h: number, a: number, g: 'male'|'female') {
  const base = (24.8*w) + (10*h) - (5.4*a);
  return g === 'male' ? base+5 : base-161;
}

export function calculateTMB(w: number, h: number, a: number, g: 'male'|'female', f: TMBFormula) {
  switch(f) {
    case 'harris-benedict': return calculateTMBHarrisBenedict(w,h,a,g);
    case 'mifflin-st-jeor': return calculateTMBMifflinStJeor(w,h,a,g);
    case 'tinsley': return calculateTMBTinsley(w,h,a,g);
    default: throw new Error("Fórmula inválida");
  }
}

export function calculateGET(tmb: number, level: ActivityLevel) {
  return tmb * ACTIVITY_FACTORS[level];
}

export function calculateVET(get: number, adj=0) {
  return get + adj;
}

export function calculateMacros(vet: number, cfg: MacroConfig, weight: number) {
  let p: number, c: number, f: number;

  if(cfg.type === 'grams_per_kg') {
    p = cfg.protein*weight;
    c = cfg.carbs*weight;
    f = cfg.fat*weight;
  } else {
    p = (vet*cfg.protein/100)/4;
    c = (vet*cfg.carbs/100)/4;
    f = (vet*cfg.fat/100)/9;
  }

  const calP=p*4, calC=c*4, calF=f*9;
  const total=calP+calC+calF;

  return {
    protein:{grams:p,calories:calP,percentage:(calP/total)*100},
    carbs:{grams:c,calories:calC,percentage:(calC/total)*100},
    fat:{grams:f,calories:calF,percentage:(calF/total)*100}
  }
}

export function calculateCompleteNutrition(patient: PatientData, macros: MacroConfig, adj=0, formula: TMBFormula='harris-benedict'): CalculationResult {
  const tmb = calculateTMB(patient.weight, patient.height, patient.age, patient.gender, formula);
  const get = calculateGET(tmb, patient.activityLevel);
  const vet = calculateVET(get, adj);
  const m = calculateMacros(vet, macros, patient.weight);

  return { tmb:Math.round(tmb), get:Math.round(get), vet:Math.round(vet), macros:m, formula, activityFactor:ACTIVITY_FACTORS[patient.activityLevel], energyAdjustment:adj }
}
