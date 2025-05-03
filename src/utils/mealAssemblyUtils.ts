
import { MealItem } from '@/types/meal';

export const MEAL_DISTRIBUTIONS = [
  { name: 'Café da manhã', time: '07:00', proteinPercent: 0.15, carbsPercent: 0.25, fatPercent: 0.20 },
  { name: 'Lanche da manhã', time: '10:00', proteinPercent: 0.15, carbsPercent: 0.15, fatPercent: 0.10 },
  { name: 'Almoço', time: '12:30', proteinPercent: 0.20, carbsPercent: 0.20, fatPercent: 0.20 },
  { name: 'Lanche da tarde', time: '15:30', proteinPercent: 0.15, carbsPercent: 0.10, fatPercent: 0.10 },
  { name: 'Jantar', time: '19:00', proteinPercent: 0.15, carbsPercent: 0.15, fatPercent: 0.20 },
  { name: 'Ceia', time: '22:00', proteinPercent: 0.20, carbsPercent: 0.15, fatPercent: 0.20 }
];

// Sample food database
export const FOOD_DATABASE: MealItem[] = [
  { name: 'Arroz branco cozido', portion: '100g', calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  { name: 'Feijão carioca', portion: '100g', calories: 76, protein: 5.1, carbs: 13.6, fat: 0.5 },
  { name: 'Peito de frango grelhado', portion: '100g', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  { name: 'Ovo cozido', portion: '1 unidade', calories: 78, protein: 6.3, carbs: 0.6, fat: 5.3 },
  { name: 'Pão integral', portion: '1 fatia', calories: 65, protein: 3.5, carbs: 12, fat: 1 },
  { name: 'Leite desnatado', portion: '200ml', calories: 68, protein: 6.8, carbs: 10, fat: 0 },
  { name: 'Banana', portion: '1 unidade média', calories: 105, protein: 1.3, carbs: 27, fat: 0.3 },
  { name: 'Maçã', portion: '1 unidade média', calories: 95, protein: 0.5, carbs: 25, fat: 0.3 },
  { name: 'Aveia em flocos', portion: '30g', calories: 117, protein: 4, carbs: 20, fat: 2.3 },
  { name: 'Batata doce cozida', portion: '100g', calories: 86, protein: 1.6, carbs: 20, fat: 0.1 },
  { name: 'Azeite de oliva', portion: '1 colher de sopa', calories: 119, protein: 0, carbs: 0, fat: 13.5 },
  { name: 'Queijo branco', portion: '30g', calories: 80, protein: 5, carbs: 2, fat: 5 },
  { name: 'Tapioca', portion: '1 unidade média', calories: 130, protein: 0.5, carbs: 32, fat: 0.3 },
  { name: 'Iogurte natural', portion: '200g', calories: 122, protein: 8, carbs: 12, fat: 4 },
  { name: 'Almôndegas ao sugo', portion: '100g', calories: 210, protein: 15, carbs: 10, fat: 12 },
  { name: 'Mix de castanhas', portion: '25g', calories: 160, protein: 5, carbs: 5, fat: 13 },
  { name: 'Atum em água', portion: '100g', calories: 116, protein: 26, carbs: 0, fat: 0.8 },
  { name: 'Quinoa cozida', portion: '100g', calories: 120, protein: 4.4, carbs: 21, fat: 1.9 },
  { name: 'Abacate', portion: '1/2 unidade', calories: 160, protein: 2, carbs: 8, fat: 15 },
  { name: 'Brócolis cozido', portion: '100g', calories: 35, protein: 2.4, carbs: 7, fat: 0.4 }
];

export const filterFoodsByMeal = (mealName: string): MealItem[] => {
  const lowerMealName = mealName.toLowerCase();
  
  if (lowerMealName.includes('café') || lowerMealName.includes('manha')) {
    return FOOD_DATABASE.filter(food => 
      ['pão', 'leite', 'iogurte', 'banana', 'maçã', 'aveia', 'tapioca', 'ovo'].some(
        item => food.name.toLowerCase().includes(item)
      )
    );
  }
  
  if (lowerMealName.includes('almoço')) {
    return FOOD_DATABASE.filter(food => 
      ['arroz', 'feijão', 'frango', 'batata', 'almôndega', 'atum', 'quinoa', 'brócolis'].some(
        item => food.name.toLowerCase().includes(item)
      )
    );
  }
  
  if (lowerMealName.includes('jantar')) {
    return FOOD_DATABASE.filter(food => 
      ['frango', 'batata', 'arroz', 'quinoa', 'atum', 'brócolis'].some(
        item => food.name.toLowerCase().includes(item)
      )
    );
  }
  
  // Lanches e ceia
  return FOOD_DATABASE.filter(food => 
    ['iogurte', 'banana', 'maçã', 'mix de castanhas', 'abacate', 'queijo'].some(
      item => food.name.toLowerCase().includes(item)
    )
  );
};

export const generatePdfData = (meals: any[], patientName: string, patientData: any, totalCalories: number, macros: any) => {
  return {
    meals,
    patientName,
    patientData,
    totalCalories,
    macros
  };
};
