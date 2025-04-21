
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from "@/components/ui/use-toast";

const MealPlanGenerator = () => {
  const { toast } = useToast();
  
  const [numMeals, setNumMeals] = useState('4');
  const [totalCalories, setTotalCalories] = useState('2000');
  const [dietType, setDietType] = useState('balanced');
  const [restrictions, setRestrictions] = useState<string[]>([]);
  const [mealPlan, setMealPlan] = useState<any>(null);

  // Sample food items for each meal type
  const foodDatabase = {
    breakfast: [
      'Ovos mexidos', 'Pão integral', 'Aveia', 'Iogurte', 'Frutas', 
      'Omelete', 'Tapioca', 'Smoothie proteico', 'Panquecas'
    ],
    lunch: [
      'Arroz integral', 'Feijão', 'Frango grelhado', 'Peixe', 'Carne magra',
      'Salada verde', 'Legumes', 'Batata doce', 'Quinoa'
    ],
    snack: [
      'Nozes', 'Frutas', 'Iogurte', 'Barra de proteína', 'Hummus com vegetais',
      'Queijo branco', 'Ovo cozido', 'Shake proteico'
    ],
    dinner: [
      'Frango assado', 'Peixe grelhado', 'Omelete', 'Sopas', 'Saladas',
      'Legumes', 'Carne magra', 'Tofu', 'Cogumelos'
    ]
  };

  const restrictionOptions = [
    { id: 'gluten', label: 'Sem Glúten' },
    { id: 'dairy', label: 'Sem Laticínios' },
    { id: 'vegetarian', label: 'Vegetariano' },
    { id: 'vegan', label: 'Vegano' },
    { id: 'nut-free', label: 'Sem Nozes' },
    { id: 'low-sodium', label: 'Baixo Sódio' },
  ];

  const handleRestrictionChange = (id: string) => {
    setRestrictions(current => 
      current.includes(id)
        ? current.filter(item => item !== id)
        : [...current, id]
    );
  };

  const generateMealPlan = () => {
    const meals = parseInt(numMeals);
    const calories = parseInt(totalCalories);
    
    // Calculate calories per meal (simple distribution)
    const caloriesPerMeal = Math.round(calories / meals);
    
    // Generate meal plan based on number of meals
    let plan = [];
    
    // Always include breakfast and dinner
    const breakfastCalories = Math.round(calories * 0.25); // 25% for breakfast
    const dinnerCalories = Math.round(calories * 0.30); // 30% for dinner
    
    // Remaining calories for other meals
    const remainingCalories = calories - breakfastCalories - dinnerCalories;
    
    // Add breakfast
    plan.push({
      name: 'Café da manhã',
      time: '07:00',
      calories: breakfastCalories,
      items: getRandomFoodItems('breakfast', 3, restrictions),
      macros: generateMacros(breakfastCalories)
    });
    
    // Distribute remaining meals
    if (meals >= 3) {
      const lunchCalories = Math.round(remainingCalories * 0.6); // 60% of remaining for lunch
      plan.push({
        name: 'Almoço',
        time: '12:00',
        calories: lunchCalories,
        items: getRandomFoodItems('lunch', 4, restrictions),
        macros: generateMacros(lunchCalories)
      });
      
      // Distribute snacks if more than 3 meals
      if (meals > 3) {
        const snackCalories = Math.round(remainingCalories * 0.4 / (meals - 3));
        for (let i = 0; i < meals - 3; i++) {
          plan.push({
            name: `Lanche ${i + 1}`,
            time: i === 0 ? '16:00' : `${17 + i}:00`,
            calories: snackCalories,
            items: getRandomFoodItems('snack', 2, restrictions),
            macros: generateMacros(snackCalories)
          });
        }
      }
    }
    
    // Add dinner
    plan.push({
      name: 'Jantar',
      time: '20:00',
      calories: dinnerCalories,
      items: getRandomFoodItems('dinner', 3, restrictions),
      macros: generateMacros(dinnerCalories)
    });
    
    // Sort meals by time
    plan.sort((a, b) => {
      const timeA = parseInt(a.time.split(':')[0]);
      const timeB = parseInt(b.time.split(':')[0]);
      return timeA - timeB;
    });
    
    setMealPlan(plan);
    
    toast({
      title: "Plano Alimentar Gerado",
      description: `Plano com ${meals} refeições e ${calories} calorias criado.`,
    });
  };

  const getRandomFoodItems = (mealType: keyof typeof foodDatabase, count: number, restrictions: string[]) => {
    const items = [...foodDatabase[mealType]];
    const result = [];
    
    // Simple filtering based on restrictions (in a real app, this would be more sophisticated)
    let filteredItems = items;
    if (restrictions.includes('vegan') || restrictions.includes('vegetarian')) {
      // Remove meat items (simplified)
      filteredItems = filteredItems.filter(item => 
        !['Frango', 'Peixe', 'Carne', 'Omelete', 'Ovos'].some(meat => 
          item.toLowerCase().includes(meat.toLowerCase())
        )
      );
    }
    
    // Select random items
    for (let i = 0; i < count && filteredItems.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * filteredItems.length);
      result.push(filteredItems[randomIndex]);
      filteredItems.splice(randomIndex, 1);
    }
    
    return result;
  };

  const generateMacros = (calories: number) => {
    let carbPercentage, proteinPercentage, fatPercentage;
    
    // Different macro ratios based on diet type
    switch (dietType) {
      case 'low-carb':
        carbPercentage = 0.20; // 20% carbs
        proteinPercentage = 0.40; // 40% protein
        fatPercentage = 0.40; // 40% fat
        break;
      case 'high-protein':
        carbPercentage = 0.30; // 30% carbs
        proteinPercentage = 0.45; // 45% protein
        fatPercentage = 0.25; // 25% fat
        break;
      case 'balanced':
      default:
        carbPercentage = 0.50; // 50% carbs
        proteinPercentage = 0.25; // 25% protein
        fatPercentage = 0.25; // 25% fat
    }
    
    const carbCalories = calories * carbPercentage;
    const proteinCalories = calories * proteinPercentage;
    const fatCalories = calories * fatPercentage;
    
    return {
      carbs: Math.round(carbCalories / 4), // 4 calories per gram
      protein: Math.round(proteinCalories / 4), // 4 calories per gram
      fat: Math.round(fatCalories / 9), // 9 calories per gram
    };
  };

  return (
    <div>
      <Card className="nutri-card">
        <CardHeader>
          <CardTitle>Gerador de Planos Alimentares</CardTitle>
          <CardDescription>
            Crie um plano alimentar personalizado com base nas necessidades do paciente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="settings">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="settings">Configurações</TabsTrigger>
              <TabsTrigger value="result" disabled={!mealPlan}>Resultado</TabsTrigger>
            </TabsList>
            
            <TabsContent value="settings" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="calories">Calorias Totais</Label>
                    <Input 
                      id="calories" 
                      type="number" 
                      value={totalCalories} 
                      onChange={(e) => setTotalCalories(e.target.value)} 
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="meals">Número de Refeições</Label>
                    <Select value={numMeals} onValueChange={(value) => setNumMeals(value)}>
                      <SelectTrigger id="meals">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 Refeições</SelectItem>
                        <SelectItem value="4">4 Refeições</SelectItem>
                        <SelectItem value="5">5 Refeições</SelectItem>
                        <SelectItem value="6">6 Refeições</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="diet-type">Tipo de Dieta</Label>
                    <Select value={dietType} onValueChange={(value) => setDietType(value)}>
                      <SelectTrigger id="diet-type">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="balanced">Balanceada</SelectItem>
                        <SelectItem value="low-carb">Baixo Carboidrato</SelectItem>
                        <SelectItem value="high-protein">Rica em Proteínas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Label>Restrições Alimentares</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {restrictionOptions.map((option) => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={option.id} 
                          checked={restrictions.includes(option.id)}
                          onCheckedChange={() => handleRestrictionChange(option.id)} 
                        />
                        <Label htmlFor={option.id} className="cursor-pointer">{option.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="result">
              {mealPlan && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Plano Alimentar</h3>
                    <p className="text-sm text-gray-600">
                      Total: {totalCalories} calorias | {numMeals} refeições | Tipo: {
                        dietType === 'balanced' ? 'Balanceada' : 
                        dietType === 'low-carb' ? 'Baixo Carboidrato' : 
                        'Rica em Proteínas'
                      }
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    {mealPlan.map((meal: any, index: number) => (
                      <Card key={index} className="overflow-hidden">
                        <div className="bg-nutri-gray-light px-6 py-3 flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">{meal.name}</h4>
                            <p className="text-sm text-gray-600">{meal.time}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{meal.calories} kcal</p>
                            <p className="text-xs text-gray-600">
                              {meal.macros.carbs}g C | {meal.macros.protein}g P | {meal.macros.fat}g G
                            </p>
                          </div>
                        </div>
                        <CardContent className="pt-4">
                          <ul className="list-disc pl-5 space-y-1">
                            {meal.items.map((item: string, idx: number) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            onClick={generateMealPlan}
            className="bg-nutri-green hover:bg-nutri-green-dark"
          >
            Gerar Plano Alimentar
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default MealPlanGenerator;
