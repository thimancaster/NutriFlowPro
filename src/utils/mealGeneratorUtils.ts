
import { supabase } from "@/integrations/supabase/client";

// Database of food items organized by meal type
export const foodDatabase = {
  breakfast: [
    { name: 'Ovos mexidos', portion: '2 unidades', calories: 140 },
    { name: 'Pão integral', portion: '2 fatias', calories: 120 },
    { name: 'Aveia', portion: '3 colheres de sopa', calories: 150 },
    { name: 'Iogurte', portion: '200ml', calories: 100 },
    { name: 'Frutas', portion: '1 porção média', calories: 60 },
    { name: 'Omelete', portion: '2 ovos', calories: 160 },
    { name: 'Tapioca', portion: '1 unidade média', calories: 130 },
    { name: 'Smoothie proteico', portion: '300ml', calories: 200 },
    { name: 'Panquecas', portion: '2 unidades médias', calories: 180 }
  ],
  lunch: [
    { name: 'Arroz integral', portion: '4 colheres de sopa', calories: 160 },
    { name: 'Feijão', portion: '1 concha média', calories: 140 },
    { name: 'Frango grelhado', portion: '150g', calories: 165 },
    { name: 'Peixe', portion: '150g', calories: 170 },
    { name: 'Carne magra', portion: '150g', calories: 180 },
    { name: 'Salada verde', portion: '2 xícaras', calories: 50 },
    { name: 'Legumes', portion: '1 xícara', calories: 70 },
    { name: 'Batata doce', portion: '1 unidade média', calories: 110 },
    { name: 'Quinoa', portion: '4 colheres de sopa', calories: 140 }
  ],
  snack: [
    { name: 'Nozes', portion: '30g', calories: 180 },
    { name: 'Frutas', portion: '1 unidade média', calories: 60 },
    { name: 'Iogurte', portion: '200ml', calories: 100 },
    { name: 'Barra de proteína', portion: '1 unidade', calories: 200 },
    { name: 'Hummus com vegetais', portion: '2 colheres + 1 xícara', calories: 150 },
    { name: 'Queijo branco', portion: '2 fatias', calories: 140 },
    { name: 'Ovo cozido', portion: '2 unidades', calories: 140 },
    { name: 'Shake proteico', portion: '300ml', calories: 160 }
  ],
  dinner: [
    { name: 'Frango assado', portion: '150g', calories: 165 },
    { name: 'Peixe grelhado', portion: '150g', calories: 170 },
    { name: 'Omelete', portion: '3 ovos', calories: 240 },
    { name: 'Sopas', portion: '300ml', calories: 200 },
    { name: 'Saladas', portion: '3 xícaras', calories: 75 },
    { name: 'Legumes', portion: '1.5 xícara', calories: 105 },
    { name: 'Carne magra', portion: '150g', calories: 180 },
    { name: 'Tofu', portion: '150g', calories: 120 },
    { name: 'Cogumelos', portion: '1 xícara', calories: 40 }
  ]
};

// Function to get random food items based on meal type and dietary restrictions
export const getRandomFoodItems = (mealType: keyof typeof foodDatabase, count: number, restrictions: string[]) => {
  const items = [...foodDatabase[mealType]];
  const result = [];
  
  let filteredItems = items;
  if (restrictions.includes('vegan') || restrictions.includes('vegetarian')) {
    filteredItems = filteredItems.filter(item => 
      !['Frango', 'Peixe', 'Carne', 'Omelete', 'Ovos'].some(meat => 
        item.name.toLowerCase().includes(meat.toLowerCase())
      )
    );
  }
  
  for (let i = 0; i < count && filteredItems.length > 0; i++) {
    const randomIndex = Math.floor(Math.random() * filteredItems.length);
    result.push(filteredItems[randomIndex]);
    filteredItems.splice(randomIndex, 1);
  }
  
  return result;
};

// Calculate macros based on calories and diet type
export const generateMacros = (calories: number, dietType: string) => {
  // Standard distribution: 20% protein, 55% carbs, 25% fat
  let carbPercentage = 0.55;
  let proteinPercentage = 0.20;
  let fatPercentage = 0.25;
  
  // Can be adjusted based on diet type if needed
  switch (dietType) {
    case 'low-carb':
      carbPercentage = 0.30;
      proteinPercentage = 0.35;
      fatPercentage = 0.35;
      break;
    case 'high-protein':
      carbPercentage = 0.45;
      proteinPercentage = 0.30;
      fatPercentage = 0.25;
      break;
    case 'balanced':
    default:
      // Use default values
      break;
  }
  
  const carbCalories = calories * carbPercentage;
  const proteinCalories = calories * proteinPercentage;
  const fatCalories = calories * fatPercentage;
  
  return {
    carbs: Math.round(carbCalories / 4),
    protein: Math.round(proteinCalories / 4),
    fat: Math.round(fatCalories / 9),
  };
};

// Meal distributions as specified
export const MEAL_DISTRIBUTIONS = {
  'ref1': { protein: 0.15, carbs: 0.25, fat: 0.20 },
  'ref2': { protein: 0.15, carbs: 0.15, fat: 0.10 },
  'ref3': { protein: 0.20, carbs: 0.20, fat: 0.20 },
  'ref4': { protein: 0.15, carbs: 0.10, fat: 0.10 },
  'ref5': { protein: 0.15, carbs: 0.15, fat: 0.20 },
  'ref6': { protein: 0.20, carbs: 0.15, fat: 0.20 }
};

// Generate a complete meal plan based on the provided settings
export const generateMealPlanData = (
  numMeals: string, 
  totalCalories: string, 
  dietType: string, 
  restrictions: string[]
) => {
  const meals = parseInt(numMeals);
  const calories = parseInt(totalCalories);
  
  // Define meal names and distribution based on number of meals
  const mealNames = [];
  const mealTimes = [];
  
  if (meals === 6) {
    mealNames.push('Café da manhã', 'Lanche da manhã', 'Almoço', 'Lanche da tarde', 'Jantar', 'Ceia');
    mealTimes.push('07:00', '10:00', '12:30', '15:30', '19:00', '22:00');
  } else if (meals === 5) {
    mealNames.push('Café da manhã', 'Lanche da manhã', 'Almoço', 'Lanche da tarde', 'Jantar');
    mealTimes.push('07:30', '10:30', '13:00', '16:00', '19:30');
  } else if (meals === 4) {
    mealNames.push('Café da manhã', 'Almoço', 'Lanche da tarde', 'Jantar');
    mealTimes.push('07:30', '12:30', '16:00', '19:30');
  } else { // 3 meals
    mealNames.push('Café da manhã', 'Almoço', 'Jantar');
    mealTimes.push('08:00', '13:00', '20:00');
  }
  
  // Calculate calories per meal using the specified distribution
  const plan = [];
  const totalMacros = generateMacros(calories, dietType);
  
  for (let i = 0; i < meals; i++) {
    // Use meal distribution percentages if available
    const refKey = `ref${i + 1}` as keyof typeof MEAL_DISTRIBUTIONS;
    const mealDistribution = MEAL_DISTRIBUTIONS[refKey] || { 
      protein: 1/meals,
      carbs: 1/meals,
      fat: 1/meals
    };
    
    const mealCalories = Math.round(calories / meals);
    
    const mealMacros = {
      protein: Math.round(totalMacros.protein * mealDistribution.protein / (1/meals)),
      carbs: Math.round(totalMacros.carbs * mealDistribution.carbs / (1/meals)),
      fat: Math.round(totalMacros.fat * mealDistribution.fat / (1/meals))
    };
    
    plan.push({
      name: mealNames[i],
      time: mealTimes[i],
      calories: mealCalories,
      items: getRandomFoodItems(
        i === 0 ? 'breakfast' : 
        i === 2 || i === 4 ? 'lunch' : 
        i === meals - 1 ? 'dinner' : 'snack', 
        i === 0 || i === 2 || i === 4 ? 3 : 2, 
        restrictions
      ),
      macros: mealMacros
    });
  }
  
  return plan;
};

// Save meal plan to database
export async function saveMealPlan(consultationId: string, meals: any[], totalMacros: any) {
  try {
    // Check if supabase client is defined
    if (!supabase) {
      console.error('Supabase client is not defined');
      return {
        success: false,
        message: 'Erro de conexão com o banco de dados'
      };
    }
    
    const { data, error } = await supabase
      .from('meal_plans')
      .insert({
        consultation_id: consultationId,
        meals,
        total_calories: totalMacros.totalCalories,
        total_protein: totalMacros.totalProtein,
        total_carbs: totalMacros.totalCarbs,
        total_fats: totalMacros.totalFats,
        date: new Date().toISOString().split('T')[0]
      })
      .select()
      .maybeSingle();

    if (error) throw error;
    
    return {
      success: true,
      data,
      message: 'Plano alimentar salvo com sucesso'
    };
  } catch (error: any) {
    console.error('Error saving meal plan:', error);
    return {
      success: false,
      message: 'Falha ao salvar plano alimentar: ' + error.message
    };
  }
}
