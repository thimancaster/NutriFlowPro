
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
  let carbPercentage, proteinPercentage, fatPercentage;
  
  switch (dietType) {
    case 'low-carb':
      carbPercentage = 0.20;
      proteinPercentage = 0.40;
      fatPercentage = 0.40;
      break;
    case 'high-protein':
      carbPercentage = 0.30;
      proteinPercentage = 0.45;
      fatPercentage = 0.25;
      break;
    case 'balanced':
    default:
      carbPercentage = 0.50;
      proteinPercentage = 0.25;
      fatPercentage = 0.25;
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

// Generate a complete meal plan based on the provided settings
export const generateMealPlanData = (
  numMeals: string, 
  totalCalories: string, 
  dietType: string, 
  restrictions: string[]
) => {
  const meals = parseInt(numMeals);
  const calories = parseInt(totalCalories);
  
  const breakfastCalories = Math.round(calories * 0.25);
  const dinnerCalories = Math.round(calories * 0.30);
  
  const remainingCalories = calories - breakfastCalories - dinnerCalories;
  
  const plan = [];
  
  plan.push({
    name: 'Café da manhã',
    time: '07:00',
    calories: breakfastCalories,
    items: getRandomFoodItems('breakfast', 3, restrictions),
    macros: generateMacros(breakfastCalories, dietType)
  });
  
  if (meals >= 3) {
    const lunchCalories = Math.round(remainingCalories * 0.6);
    plan.push({
      name: 'Almoço',
      time: '12:00',
      calories: lunchCalories,
      items: getRandomFoodItems('lunch', 4, restrictions),
      macros: generateMacros(lunchCalories, dietType)
    });
    
    if (meals > 3) {
      const snackCalories = Math.round(remainingCalories * 0.4 / (meals - 3));
      for (let i = 0; i < meals - 3; i++) {
        plan.push({
          name: `Lanche ${i + 1}`,
          time: i === 0 ? '16:00' : `${17 + i}:00`,
          calories: snackCalories,
          items: getRandomFoodItems('snack', 2, restrictions),
          macros: generateMacros(snackCalories, dietType)
        });
      }
    }
  }
  
  plan.push({
    name: 'Jantar',
    time: '20:00',
    calories: dinnerCalories,
    items: getRandomFoodItems('dinner', 3, restrictions),
    macros: generateMacros(dinnerCalories, dietType)
  });
  
  return plan.sort((a, b) => {
    const timeA = parseInt(a.time.split(':')[0]);
    const timeB = parseInt(b.time.split(':')[0]);
    return timeA - timeB;
  });
};
