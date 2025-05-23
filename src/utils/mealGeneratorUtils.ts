
import { format } from 'date-fns';
import { MealPlan, MealItem, MealDistributionItem } from '@/types/meal';

export interface MealPlanSettings {
  numMeals: string;
  totalCalories: string;
  dietType: string;
  restrictions: string[];
  patientName?: string;
  patientData?: any;
  patientAge?: number;
  patientGender?: string;
}

// Define meal options that were missing
export const mealOptions = [
  { id: 'breakfast', name: 'Café da manhã' },
  { id: 'morning_snack', name: 'Lanche da manhã' },
  { id: 'lunch', name: 'Almoço' },
  { id: 'afternoon_snack', name: 'Lanche da tarde' },
  { id: 'dinner', name: 'Jantar' },
  { id: 'evening_snack', name: 'Ceia' },
  { id: 'pre_workout', name: 'Pré-treino' },
  { id: 'post_workout', name: 'Pós-treino' }
];

// Food categories with their properties
const foodCategories = {
  protein: {
    foods: [
      'Frango grelhado', 'Peixe assado', 'Carne magra', 'Ovos', 
      'Tofu', 'Whey protein', 'Iogurte grego', 'Queijo cottage'
    ],
    portionUnit: 'g',
    calories: 4 // calories per gram
  },
  carbs: {
    foods: [
      'Arroz integral', 'Batata doce', 'Aveia', 'Quinoa', 
      'Pão integral', 'Macarrão integral', 'Frutas', 'Legumes'
    ],
    portionUnit: 'g',
    calories: 4 // calories per gram
  },
  fats: {
    foods: [
      'Azeite', 'Abacate', 'Oleaginosas', 'Sementes de chia',
      'Manteiga ghee', 'Óleo de coco', 'Sementes de linhaça', 'Castanhas'
    ],
    portionUnit: 'g',
    calories: 9 // calories per gram
  }
};

// Generate meal plan data based on user settings
export function generateMealPlanData(
  numMeals: string, 
  totalCalories: string, 
  dietType: string,
  restrictions: string[]
): MealPlan {
  // Calculate calories per meal
  const mealCount = parseInt(numMeals);
  const totalCals = parseInt(totalCalories);
  const caloriesPerMeal = Math.round(totalCals / mealCount);
  
  // Set macro distribution based on diet type
  let proteinPercentage = 0.25;
  let carbsPercentage = 0.50;
  let fatsPercentage = 0.25;
  
  switch (dietType) {
    case 'low-carb':
      proteinPercentage = 0.35;
      carbsPercentage = 0.25;
      fatsPercentage = 0.40;
      break;
    case 'high-protein':
      proteinPercentage = 0.40;
      carbsPercentage = 0.35;
      fatsPercentage = 0.25;
      break;
    case 'keto':
      proteinPercentage = 0.25;
      carbsPercentage = 0.05;
      fatsPercentage = 0.70;
      break;
    // Default 'balanced' uses the initial values
  }
  
  // Filter out restricted foods
  const filteredFoodCategories = { ...foodCategories };
  if (restrictions.length > 0) {
    Object.keys(filteredFoodCategories).forEach(category => {
      const categoryKey = category as keyof typeof foodCategories;
      const foods = foodCategories[categoryKey].foods.filter(
        food => !restrictions.some(restriction => food.toLowerCase().includes(restriction.toLowerCase()))
      );
      filteredFoodCategories[categoryKey] = {
        ...filteredFoodCategories[categoryKey],
        foods
      };
    });
  }
  
  // Generate meals
  const mealItems: MealItem[] = Array.from({ length: mealCount }, (_, i) => {
    // Calculate macros for this meal
    const mealProtein = Math.round((caloriesPerMeal * proteinPercentage) / 4); // 4 calories per gram
    const mealCarbs = Math.round((caloriesPerMeal * carbsPercentage) / 4); // 4 calories per gram
    const mealFats = Math.round((caloriesPerMeal * fatsPercentage) / 9); // 9 calories per gram
    
    // Determine meal name based on index
    let mealName = '';
    if (mealCount <= 3) {
      mealName = i === 0 ? 'Café da manhã' : i === 1 ? 'Almoço' : 'Jantar';
    } else if (mealCount <= 6) {
      const mealNames = [
        'Café da manhã', 'Lanche da manhã', 'Almoço', 
        'Lanche da tarde', 'Jantar', 'Ceia'
      ];
      mealName = mealNames[i];
    } else {
      mealName = `Refeição ${i + 1}`;
    }
    
    // Select food items for this meal
    const proteinFoods = selectRandomItems(filteredFoodCategories.protein.foods, 2);
    const carbFoods = selectRandomItems(filteredFoodCategories.carbs.foods, 2);
    const fatFoods = selectRandomItems(filteredFoodCategories.fats.foods, 1);
    
    return {
      mealNumber: i + 1,
      name: mealName,
      time: '', // Add required time property
      calories: caloriesPerMeal,
      protein: mealProtein,
      carbs: mealCarbs,
      fat: mealFats,
      percentage: 100 / mealCount,
      proteinPercent: proteinPercentage * 100,
      carbsPercent: carbsPercentage * 100,
      fatPercent: fatsPercentage * 100,
      foodSuggestions: [...proteinFoods, ...carbFoods, ...fatFoods],
      foods: [] // Add required foods property
    };
  });
  
  // Calculate totals
  const totalProtein = mealItems.reduce((sum, meal) => sum + meal.protein, 0);
  const totalCarbs = mealItems.reduce((sum, meal) => sum + meal.carbs, 0);
  const totalFats = mealItems.reduce((sum, meal) => sum + meal.fat, 0);

  // Convert MealItem[] to Meal[] for the MealPlan
  const meals = mealItems.map(meal => ({
    id: '',
    name: meal.name,
    time: meal.time,
    foods: [],
    totalCalories: meal.calories,
    totalProtein: meal.protein,
    totalCarbs: meal.carbs,
    totalFats: meal.fat
  }));
  
  return {
    id: '',  // Will be assigned by backend
    title: `Plano Alimentar - ${new Date().toLocaleDateString()}`,
    name: `Plano Alimentar - ${new Date().toLocaleDateString()}`,
    patient_id: '',  // This should be filled in by the parent component
    user_id: '', // Add required user_id property
    date: format(new Date(), 'yyyy-MM-dd'),
    total_calories: parseInt(totalCalories),
    total_protein: totalProtein,
    total_carbs: totalCarbs,
    total_fats: totalFats,
    meals: meals,
    created_at: format(new Date(), 'yyyy-MM-dd'),
    updated_at: format(new Date(), 'yyyy-MM-dd'),
    mealDistribution: {} // Initialize as empty object
  };
}

// Helper function to select random items from an array
function selectRandomItems<T>(arr: T[], count: number): T[] {
  const result: T[] = [];
  const arrCopy = [...arr];
  
  for (let i = 0; i < count && arrCopy.length > 0; i++) {
    const randomIndex = Math.floor(Math.random() * arrCopy.length);
    result.push(arrCopy[randomIndex]);
    arrCopy.splice(randomIndex, 1);
  }
  
  return result;
}
