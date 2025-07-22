
interface CalculationParams {
  weight: number;
  height: number;
  age: number;
  gender: 'male' | 'female';
  activityLevel: string;
  objective: string;
}

interface CalculationResults {
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

const ACTIVITY_FACTORS: Record<string, number> = {
  sedentario: 1.2,
  leve: 1.375,
  moderado: 1.55,
  intenso: 1.725,
  muito_intenso: 1.9
};

const OBJECTIVE_FACTORS: Record<string, number> = {
  emagrecimento: 0.8,    // 20% déficit
  manutenção: 1.0,       // Sem ajuste
  hipertrofia: 1.15,     // 15% superávit
  personalizado: 1.0     // Sem ajuste padrão
};

export const calculateNutritionalNeeds = (params: CalculationParams): CalculationResults => {
  const { weight, height, age, gender, activityLevel, objective } = params;

  // Calculate BMR using Harris-Benedict equation
  let bmr: number;
  if (gender === 'male') {
    bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
  } else {
    bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
  }

  // Calculate GET (Total Energy Expenditure)
  const activityFactor = ACTIVITY_FACTORS[activityLevel] || 1.55;
  const get = bmr * activityFactor;

  // Calculate VET (Adjusted Energy Value based on objective)
  const objectiveFactor = OBJECTIVE_FACTORS[objective] || 1.0;
  const vet = get * objectiveFactor;
  const adjustment = objectiveFactor;

  // Calculate macronutrients
  // Protein: 1.2-2.0g per kg body weight depending on activity
  let proteinPerKg = 1.6; // Default for moderate activity
  if (activityLevel === 'sedentario') proteinPerKg = 1.2;
  if (activityLevel === 'intenso' || activityLevel === 'muito_intenso') proteinPerKg = 2.0;

  const proteinGrams = weight * proteinPerKg;
  const proteinCalories = proteinGrams * 4;

  // Fat: 20-35% of total calories (using 25% as default)
  const fatCalories = vet * 0.25;
  const fatGrams = fatCalories / 9;

  // Carbs: remaining calories
  const carbCalories = vet - proteinCalories - fatCalories;
  const carbGrams = carbCalories / 4;

  return {
    bmr: Math.round(bmr),
    get: Math.round(get),
    vet: Math.round(vet),
    adjustment,
    macros: {
      protein: Math.round(proteinGrams),
      carbs: Math.round(carbGrams),
      fat: Math.round(fatGrams)
    }
  };
};
