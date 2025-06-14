import { GERFormula } from '@/types/gerFormulas';

export interface GERCalculationParams {
  weight: number;
  height: number;
  age: number;
  sex: 'M' | 'F';
  bodyFatPercentage?: number;
}

export interface GERResult {
  ger: number;
  formula: GERFormula;
  formulaName: string;
}

/**
 * Calcula GER usando Harris-Benedict Revisada
 */
export function calculateHarrisBenedictRevisada(params: GERCalculationParams): number {
  const { weight, height, age, sex } = params;
  
  if (sex === 'M') {
    return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
  } else {
    return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
  }
}

/**
 * Calcula GER usando Mifflin-St Jeor
 */
export function calculateMifflinStJeor(params: GERCalculationParams): number {
  const { weight, height, age, sex } = params;
  
  if (sex === 'M') {
    return (10 * weight) + (6.25 * height) - (5 * age) + 5;
  } else {
    return (10 * weight) + (6.25 * height) - (5 * age) - 161;
  }
}

/**
 * Calcula GER usando Owen
 */
export function calculateOwen(params: GERCalculationParams): number {
  const { weight, sex } = params;
  
  if (sex === 'M') {
    return 879 + (10.2 * weight);
  } else {
    return 795 + (7.18 * weight);
  }
}

/**
 * Calcula GER usando Katch-McArdle
 */
export function calculateKatchMcArdle(params: GERCalculationParams): number {
  const { weight, bodyFatPercentage } = params;
  
  if (!bodyFatPercentage) {
    throw new Error('Percentual de gordura corporal é obrigatório para a fórmula Katch-McArdle');
  }
  
  const leanBodyMass = weight * (1 - bodyFatPercentage / 100);
  return 370 + (21.6 * leanBodyMass);
}

/**
 * Calcula GER usando Cunningham
 */
export function calculateCunningham(params: GERCalculationParams): number {
  const { weight, bodyFatPercentage } = params;
  
  if (!bodyFatPercentage) {
    throw new Error('Percentual de gordura corporal é obrigatório para a fórmula Cunningham');
  }
  
  const leanBodyMass = weight * (1 - bodyFatPercentage / 100);
  return 500 + (22 * leanBodyMass);
}

/**
 * Calcula GER usando Schofield
 */
export function calculateSchofield(params: GERCalculationParams): number {
  const { weight, age, sex } = params;
  
  if (sex === 'M') {
    if (age <= 3) return (60.9 * weight) - 54;
    if (age <= 10) return (22.7 * weight) + 495;
    if (age <= 18) return (17.5 * weight) + 651;
    if (age <= 30) return (15.3 * weight) + 679;
    if (age <= 60) return (11.6 * weight) + 879;
    return (13.5 * weight) + 487;
  } else {
    if (age <= 3) return (61.0 * weight) - 51;
    if (age <= 10) return (22.5 * weight) + 499;
    if (age <= 18) return (12.2 * weight) + 746;
    if (age <= 30) return (14.7 * weight) + 496;
    if (age <= 60) return (8.7 * weight) + 829;
    return (10.5 * weight) + 596;
  }
}

/**
 * Calcula GER usando a fórmula selecionada
 */
export function calculateGER(formula: GERFormula, params: GERCalculationParams): GERResult {
  let ger: number;
  let formulaName: string;
  
  switch (formula) {
    case 'harris_benedict_revisada':
      ger = calculateHarrisBenedictRevisada(params);
      formulaName = 'Harris-Benedict Revisada';
      break;
    case 'mifflin_st_jeor':
      ger = calculateMifflinStJeor(params);
      formulaName = 'Mifflin-St Jeor';
      break;
    case 'owen':
      ger = calculateOwen(params);
      formulaName = 'Owen';
      break;
    case 'katch_mcardle':
      ger = calculateKatchMcArdle(params);
      formulaName = 'Katch-McArdle';
      break;
    case 'cunningham':
      ger = calculateCunningham(params);
      formulaName = 'Cunningham';
      break;
    case 'schofield':
      ger = calculateSchofield(params);
      formulaName = 'Schofield';
      break;
    default:
      throw new Error(`Fórmula GER não reconhecida: ${formula}`);
  }
  
  return {
    ger: Math.round(ger),
    formula,
    formulaName
  };
}

/**
 * Calculates Body Mass Index (BMI)
 */
const calculateIMC = (weight: number, height: number): number => {
    if (!weight || !height || height <= 0) return 0;
    return weight / Math.pow(height / 100, 2);
};


/**
 * Recomenda a fórmula GER baseada no perfil do paciente e dados antropométricos
 */
export function recommendGERFormula(
  profile: 'eutrofico' | 'sobrepeso_obesidade' | 'atleta',
  hasBodyFat: boolean = false,
  age?: number,
  weight?: number,
  height?: number,
): GERFormula {
  // Priority 1: High BMI suggests Owen
  if (weight && height) {
    const imc = calculateIMC(weight, height);
    if (imc >= 30) {
      return 'owen';
    }
  }
  
  // Priority 2: Athlete profile
  if (profile === 'atleta') {
    // Katch-McArdle is best if body fat is known.
    // Cunningham is an alternative for athletes, which also requires body fat.
    return hasBodyFat ? 'katch_mcardle' : 'cunningham';
  }
  
  // Priority 3: Age-specific recommendations
  if (age) {
    if (age < 18 || age > 65) {
      return 'schofield';
    }
  }

  // Default for healthy adults
  return 'mifflin_st_jeor';
}
