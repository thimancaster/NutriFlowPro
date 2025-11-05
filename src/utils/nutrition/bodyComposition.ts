/**
 * BODY COMPOSITION ANALYSIS - PHASE 3
 * 
 * Complete skinfold measurement system with Jackson & Pollock protocols
 * Supports both 3-site and 7-site measurements
 * Includes body density and body fat percentage calculations using Siri and Brozek equations
 * 
 * SSOT: NUTRIFLOW_PRO_SPEC_V2.0.md Section 6
 */

export type Gender = 'M' | 'F';
export type BodyFatFormula = 'siri' | 'brozek';

/**
 * JACKSON & POLLOCK 3-SITE PROTOCOL
 * Most commonly used clinical protocol
 * 
 * Men: Chest, Abdomen, Thigh
 * Women: Triceps, Suprailiac, Thigh
 */
export interface JacksonPollock3SiteMeasurements {
  // Men
  chest?: number;      // Peitoral (mm)
  abdomen?: number;    // Abdominal (mm)
  thigh?: number;      // Coxa (mm)
  
  // Women
  triceps?: number;    // Tríceps (mm)
  suprailiac?: number; // Suprailíaca (mm)
  // thigh is shared
}

/**
 * JACKSON & POLLOCK 7-SITE PROTOCOL
 * More comprehensive assessment for detailed body composition
 * 
 * Both genders: Chest, Abdomen, Thigh, Triceps, Subscapular, Suprailiac, Midaxillary
 */
export interface JacksonPollock7SiteMeasurements {
  chest: number;        // Peitoral (mm)
  abdomen: number;      // Abdominal (mm)
  thigh: number;        // Coxa (mm)
  triceps: number;      // Tríceps (mm)
  subscapular: number;  // Subescapular (mm)
  suprailiac: number;   // Suprailíaca (mm)
  midaxillary: number;  // Axilar Média (mm)
}

/**
 * Body Composition Result
 */
export interface BodyCompositionResult {
  bodyDensity: number;           // g/cm³
  bodyFatPercentage: number;     // %
  fatMass: number;               // kg
  leanBodyMass: number;          // kg (massa magra)
  protocol: '3-site' | '7-site';
  formula: BodyFatFormula;
  gender: Gender;
}

/**
 * JACKSON & POLLOCK 3-SITE BODY DENSITY CALCULATION
 * 
 * Men (Jackson & Pollock, 1978):
 * BD = 1.10938 - (0.0008267 × sum) + (0.0000016 × sum²) - (0.0002574 × age)
 * 
 * Women (Jackson, Pollock & Ward, 1980):
 * BD = 1.0994921 - (0.0009929 × sum) + (0.0000023 × sum²) - (0.0001392 × age)
 */
export function calculateBodyDensity_JP3Site(
  measurements: JacksonPollock3SiteMeasurements,
  age: number,
  gender: Gender
): number {
  let sum: number;

  if (gender === 'M') {
    // Men: Chest + Abdomen + Thigh
    if (!measurements.chest || !measurements.abdomen || !measurements.thigh) {
      throw new Error('Para homens (3-dobras): necessário Peitoral, Abdominal e Coxa');
    }
    sum = measurements.chest + measurements.abdomen + measurements.thigh;
  } else {
    // Women: Triceps + Suprailiac + Thigh
    if (!measurements.triceps || !measurements.suprailiac || !measurements.thigh) {
      throw new Error('Para mulheres (3-dobras): necessário Tríceps, Suprailíaca e Coxa');
    }
    sum = measurements.triceps + measurements.suprailiac + measurements.thigh;
  }

  let bodyDensity: number;

  if (gender === 'M') {
    // Men's formula
    bodyDensity = 1.10938 - (0.0008267 * sum) + (0.0000016 * sum * sum) - (0.0002574 * age);
  } else {
    // Women's formula
    bodyDensity = 1.0994921 - (0.0009929 * sum) + (0.0000023 * sum * sum) - (0.0001392 * age);
  }

  console.log(`[JP3] ${gender}, ${age}anos, Σ=${sum}mm → BD = ${bodyDensity.toFixed(6)} g/cm³`);
  return bodyDensity;
}

/**
 * JACKSON & POLLOCK 7-SITE BODY DENSITY CALCULATION
 * 
 * Men (Jackson & Pollock, 1978):
 * BD = 1.112 - (0.00043499 × sum) + (0.00000055 × sum²) - (0.00028826 × age)
 * 
 * Women (Jackson, Pollock & Ward, 1980):
 * BD = 1.097 - (0.00046971 × sum) + (0.00000056 × sum²) - (0.00012828 × age)
 */
export function calculateBodyDensity_JP7Site(
  measurements: JacksonPollock7SiteMeasurements,
  age: number,
  gender: Gender
): number {
  const sum = 
    measurements.chest + 
    measurements.abdomen + 
    measurements.thigh + 
    measurements.triceps + 
    measurements.subscapular + 
    measurements.suprailiac + 
    measurements.midaxillary;

  let bodyDensity: number;

  if (gender === 'M') {
    // Men's formula
    bodyDensity = 1.112 - (0.00043499 * sum) + (0.00000055 * sum * sum) - (0.00028826 * age);
  } else {
    // Women's formula
    bodyDensity = 1.097 - (0.00046971 * sum) + (0.00000056 * sum * sum) - (0.00012828 * age);
  }

  console.log(`[JP7] ${gender}, ${age}anos, Σ=${sum}mm → BD = ${bodyDensity.toFixed(6)} g/cm³`);
  return bodyDensity;
}

/**
 * SIRI EQUATION (1961) - Body Fat Percentage from Body Density
 * Most commonly used equation in North America
 * 
 * BF% = ((4.95 / BD) - 4.5) × 100
 */
export function calculateBodyFat_Siri(bodyDensity: number): number {
  if (bodyDensity <= 0 || bodyDensity > 1.2) {
    throw new Error('Body density must be between 0 and 1.2 g/cm³');
  }

  const bodyFat = ((4.95 / bodyDensity) - 4.5) * 100;
  console.log(`[Siri] BD ${bodyDensity.toFixed(6)} → %GC = ${bodyFat.toFixed(2)}%`);
  return bodyFat;
}

/**
 * BROZEK EQUATION (1963) - Body Fat Percentage from Body Density
 * Alternative equation, more commonly used in Europe
 * 
 * BF% = ((4.57 / BD) - 4.142) × 100
 */
export function calculateBodyFat_Brozek(bodyDensity: number): number {
  if (bodyDensity <= 0 || bodyDensity > 1.2) {
    throw new Error('Body density must be between 0 and 1.2 g/cm³');
  }

  const bodyFat = ((4.57 / bodyDensity) - 4.142) * 100;
  console.log(`[Brozek] BD ${bodyDensity.toFixed(6)} → %GC = ${bodyFat.toFixed(2)}%`);
  return bodyFat;
}

/**
 * CALCULATE LEAN BODY MASS (Massa Magra)
 * LBM = Total Weight - Fat Mass
 */
export function calculateLeanBodyMass(
  weight: number,
  bodyFatPercentage: number
): number {
  if (weight <= 0) {
    throw new Error('Weight must be greater than zero');
  }
  if (bodyFatPercentage < 0 || bodyFatPercentage > 100) {
    throw new Error('Body fat percentage must be between 0 and 100');
  }

  const fatMass = (weight * bodyFatPercentage) / 100;
  const leanMass = weight - fatMass;
  
  console.log(`[LBM] Peso ${weight}kg, %GC ${bodyFatPercentage.toFixed(1)}% → MM = ${leanMass.toFixed(1)}kg (MG = ${fatMass.toFixed(1)}kg)`);
  return leanMass;
}

/**
 * COMPLETE BODY COMPOSITION ANALYSIS - 3-SITE PROTOCOL
 * All-in-one function for clinical workflow
 */
export function analyzeBodyComposition_3Site(
  measurements: JacksonPollock3SiteMeasurements,
  weight: number,
  age: number,
  gender: Gender,
  formula: BodyFatFormula = 'siri'
): BodyCompositionResult {
  // Step 1: Calculate body density
  const bodyDensity = calculateBodyDensity_JP3Site(measurements, age, gender);

  // Step 2: Convert to body fat percentage
  const bodyFatPercentage = formula === 'siri' 
    ? calculateBodyFat_Siri(bodyDensity)
    : calculateBodyFat_Brozek(bodyDensity);

  // Step 3: Calculate fat mass and lean mass
  const fatMass = (weight * bodyFatPercentage) / 100;
  const leanBodyMass = weight - fatMass;

  console.log(`[Body Comp 3-Site] %GC=${bodyFatPercentage.toFixed(1)}%, MM=${leanBodyMass.toFixed(1)}kg, MG=${fatMass.toFixed(1)}kg`);

  return {
    bodyDensity: Math.round(bodyDensity * 1000000) / 1000000, // 6 decimals
    bodyFatPercentage: Math.round(bodyFatPercentage * 100) / 100,
    fatMass: Math.round(fatMass * 100) / 100,
    leanBodyMass: Math.round(leanBodyMass * 100) / 100,
    protocol: '3-site',
    formula,
    gender
  };
}

/**
 * COMPLETE BODY COMPOSITION ANALYSIS - 7-SITE PROTOCOL
 * All-in-one function for comprehensive assessment
 */
export function analyzeBodyComposition_7Site(
  measurements: JacksonPollock7SiteMeasurements,
  weight: number,
  age: number,
  gender: Gender,
  formula: BodyFatFormula = 'siri'
): BodyCompositionResult {
  // Step 1: Calculate body density
  const bodyDensity = calculateBodyDensity_JP7Site(measurements, age, gender);

  // Step 2: Convert to body fat percentage
  const bodyFatPercentage = formula === 'siri' 
    ? calculateBodyFat_Siri(bodyDensity)
    : calculateBodyFat_Brozek(bodyDensity);

  // Step 3: Calculate fat mass and lean mass
  const fatMass = (weight * bodyFatPercentage) / 100;
  const leanBodyMass = weight - fatMass;

  console.log(`[Body Comp 7-Site] %GC=${bodyFatPercentage.toFixed(1)}%, MM=${leanBodyMass.toFixed(1)}kg, MG=${fatMass.toFixed(1)}kg`);

  return {
    bodyDensity: Math.round(bodyDensity * 1000000) / 1000000, // 6 decimals
    bodyFatPercentage: Math.round(bodyFatPercentage * 100) / 100,
    fatMass: Math.round(fatMass * 100) / 100,
    leanBodyMass: Math.round(leanBodyMass * 100) / 100,
    protocol: '7-site',
    formula,
    gender
  };
}

/**
 * VALIDATION HELPERS
 */
export function validateSkinfoldMeasurement(value: number, siteName: string): void {
  if (value < 0) {
    throw new Error(`${siteName}: valor não pode ser negativo`);
  }
  if (value > 100) {
    throw new Error(`${siteName}: valor muito alto (>100mm), verificar medição`);
  }
  if (value === 0) {
    throw new Error(`${siteName}: medição não pode ser zero`);
  }
}

export function validate3SiteMeasurements(
  measurements: JacksonPollock3SiteMeasurements,
  gender: Gender
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  try {
    if (gender === 'M') {
      if (!measurements.chest) errors.push('Peitoral é obrigatório para homens');
      if (!measurements.abdomen) errors.push('Abdominal é obrigatório para homens');
      if (!measurements.thigh) errors.push('Coxa é obrigatória');
      
      if (measurements.chest) validateSkinfoldMeasurement(measurements.chest, 'Peitoral');
      if (measurements.abdomen) validateSkinfoldMeasurement(measurements.abdomen, 'Abdominal');
      if (measurements.thigh) validateSkinfoldMeasurement(measurements.thigh, 'Coxa');
    } else {
      if (!measurements.triceps) errors.push('Tríceps é obrigatório para mulheres');
      if (!measurements.suprailiac) errors.push('Suprailíaca é obrigatória para mulheres');
      if (!measurements.thigh) errors.push('Coxa é obrigatória');
      
      if (measurements.triceps) validateSkinfoldMeasurement(measurements.triceps, 'Tríceps');
      if (measurements.suprailiac) validateSkinfoldMeasurement(measurements.suprailiac, 'Suprailíaca');
      if (measurements.thigh) validateSkinfoldMeasurement(measurements.thigh, 'Coxa');
    }
  } catch (error: any) {
    errors.push(error.message);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validate7SiteMeasurements(
  measurements: JacksonPollock7SiteMeasurements
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  const sites = [
    { value: measurements.chest, name: 'Peitoral' },
    { value: measurements.abdomen, name: 'Abdominal' },
    { value: measurements.thigh, name: 'Coxa' },
    { value: measurements.triceps, name: 'Tríceps' },
    { value: measurements.subscapular, name: 'Subescapular' },
    { value: measurements.suprailiac, name: 'Suprailíaca' },
    { value: measurements.midaxillary, name: 'Axilar Média' }
  ];

  for (const site of sites) {
    if (!site.value) {
      errors.push(`${site.name} é obrigatório para protocolo 7-dobras`);
    } else {
      try {
        validateSkinfoldMeasurement(site.value, site.name);
      } catch (error: any) {
        errors.push(error.message);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
