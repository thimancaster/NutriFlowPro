
/**
 * TMB (Taxa Metabólica Basal) Calculations
 * Implementa diferentes fórmulas de cálculo baseadas no perfil do paciente
 */

export interface TMBResult {
  tmb: number;
  formula: string;
  details: {
    weight: number;
    height: number;
    age: number;
    sex: 'M' | 'F';
    profile: string;
  };
}

/**
 * Calcula TMB usando diferentes fórmulas baseadas no perfil
 */
export function calculateTMB(
  weight: number,
  height: number,
  age: number,
  sex: 'M' | 'F',
  profile: 'magro' | 'obeso' | 'atleta'
): TMBResult {
  let tmb: number;
  let formula: string;

  switch (profile) {
    case 'atleta':
      // Para atletas, usar fórmula Cunningham (mais precisa para pessoas com baixo percentual de gordura)
      // Como não temos % de gordura, usamos Katch-McArdle modificada ou Ten Haaf
      tmb = calculateAthletesTMB(weight, height, age, sex);
      formula = 'Ten Haaf (Atletas)';
      break;
      
    case 'obeso':
      // Para obesos, usar fórmula Mifflin-St Jeor (mais precisa para obesidade)
      tmb = calculateMifflinStJeor(weight, height, age, sex);
      formula = 'Mifflin-St Jeor (Obesidade)';
      break;
      
    case 'magro':
    default:
      // Para pessoas eutróficas, usar Harris-Benedict revisada
      tmb = calculateHarrisBenedictRevised(weight, height, age, sex);
      formula = 'Harris-Benedict Revisada';
      break;
  }

  return {
    tmb: Math.round(tmb),
    formula,
    details: {
      weight,
      height,
      age,
      sex,
      profile
    }
  };
}

/**
 * Fórmula Harris-Benedict Revisada (1984)
 * Mais precisa que a versão original de 1919
 */
function calculateHarrisBenedictRevised(
  weight: number,
  height: number,
  age: number,
  sex: 'M' | 'F'
): number {
  if (sex === 'M') {
    return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
  } else {
    return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
  }
}

/**
 * Fórmula Mifflin-St Jeor (1990)
 * Considerada mais precisa para pessoas com sobrepeso/obesidade
 */
function calculateMifflinStJeor(
  weight: number,
  height: number,
  age: number,
  sex: 'M' | 'F'
): number {
  if (sex === 'M') {
    return (10 * weight) + (6.25 * height) - (5 * age) + 5;
  } else {
    return (10 * weight) + (6.25 * height) - (5 * age) - 161;
  }
}

/**
 * Fórmula Ten Haaf adaptada para atletas
 * Baseada em estudos recentes com atletas de alta performance
 * Quando não temos massa magra, usamos estimativa baseada no perfil atlético
 */
function calculateAthletesTMB(
  weight: number,
  height: number,
  age: number,
  sex: 'M' | 'F'
): number {
  // Estimativa de massa magra para atletas (percentual de gordura baixo)
  // Homens atletas: ~8-12% gordura, Mulheres atletas: ~14-20% gordura
  const estimatedBodyFatPercentage = sex === 'M' ? 0.10 : 0.17;
  const estimatedLeanMass = weight * (1 - estimatedBodyFatPercentage);
  
  // Fórmula Ten Haaf adaptada para atletas
  // TMB = 25.9 * LBM + 284 (para homens) ou 25.9 * LBM + 284 - ajuste para mulheres
  if (sex === 'M') {
    return (25.9 * estimatedLeanMass) + 284;
  } else {
    // Ajuste para mulheres baseado em diferenças metabólicas
    return (22.1 * estimatedLeanMass) + 241;
  }
}

/**
 * Fórmula Cunningham (para quando temos massa magra)
 * Mais precisa para atletas quando conhecemos a composição corporal
 */
export function calculateCunninghamTMB(leanBodyMass: number): number {
  return 500 + (22 * leanBodyMass);
}

/**
 * Validação dos parâmetros de entrada
 */
export function validateTMBParameters(
  weight: number,
  height: number,
  age: number
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (weight <= 0 || weight > 500) {
    errors.push('Peso deve estar entre 1 e 500 kg');
  }

  if (height <= 0 || height > 250) {
    errors.push('Altura deve estar entre 1 e 250 cm');
  }

  if (age <= 0 || age > 120) {
    errors.push('Idade deve estar entre 1 e 120 anos');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Calcula múltiplas fórmulas para comparação
 */
export function calculateMultipleTMBFormulas(
  weight: number,
  height: number,
  age: number,
  sex: 'M' | 'F'
): Record<string, number> {
  return {
    'Harris-Benedict Revisada': Math.round(calculateHarrisBenedictRevised(weight, height, age, sex)),
    'Mifflin-St Jeor': Math.round(calculateMifflinStJeor(weight, height, age, sex)),
    'Ten Haaf (Atletas)': Math.round(calculateAthletesTMB(weight, height, age, sex))
  };
}
