
/**
 * Calcula IMC (Índice de Massa Corporal)
 */
export const calculateIMC = (weight: number, height: number): number => {
  if (weight <= 0 || height <= 0) {
    throw new Error('Weight and height must be positive values');
  }
  
  const heightInMeters = height / 100;
  return Math.round((weight / (heightInMeters * heightInMeters)) * 100) / 100;
};

/**
 * Calcula RCQ (Relação Cintura-Quadril)
 */
export const calculateRCQ = (waist: number, hip: number): number => {
  if (waist <= 0 || hip <= 0) {
    throw new Error('Waist and hip measurements must be positive values');
  }
  
  return Math.round((waist / hip) * 100) / 100;
};

/**
 * Calcula percentual de gordura corporal usando protocolo Jackson-Pollock
 */
export const calculateBodyFatJacksonPollock = (
  sum3Folds: number, 
  age: number, 
  sex: 'M' | 'F'
): number => {
  if (sum3Folds <= 0 || age <= 0) {
    throw new Error('Sum of folds and age must be positive values');
  }
  
  let bodyDensity: number;
  
  if (sex === 'M') {
    // Fórmula para homens (Jackson & Pollock, 1978)
    bodyDensity = 1.10938 - (0.0008267 * sum3Folds) + (0.0000016 * sum3Folds * sum3Folds) - (0.0002574 * age);
  } else {
    // Fórmula para mulheres (Jackson, Pollock & Ward, 1980)
    bodyDensity = 1.0994921 - (0.0009929 * sum3Folds) + (0.0000023 * sum3Folds * sum3Folds) - (0.0001392 * age);
  }
  
  // Fórmula de Siri para conversão de densidade corporal em percentual de gordura
  const bodyFatPercentage = ((4.95 / bodyDensity) - 4.5) * 100;
  
  return Math.round(bodyFatPercentage * 100) / 100;
};

/**
 * Calcula massa magra
 */
export const calculateLeanMass = (weight: number, bodyFatPercentage: number): number => {
  if (weight <= 0 || bodyFatPercentage < 0 || bodyFatPercentage > 100) {
    throw new Error('Invalid weight or body fat percentage');
  }
  
  const fatMass = (weight * bodyFatPercentage) / 100;
  return Math.round((weight - fatMass) * 100) / 100;
};
