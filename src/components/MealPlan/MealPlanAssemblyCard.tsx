
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MealAssemblyFood } from '@/types/meal';
import { Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface AssemblyMeal {
  name: string;
  time: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  proteinPercent: number;
  carbsPercent: number;
  fatPercent: number;
  foods: MealAssemblyFood[];
}

interface MealPlanAssemblyCardProps {
  meal: AssemblyMeal;
  mealIndex: number;
  onAddFood: (mealIndex: number, food: MealAssemblyFood) => void;
  onRemoveFood: (mealIndex: number, foodIndex: number) => void;
  suggestedFoods: MealAssemblyFood[];
}

const MealPlanAssemblyCard: React.FC<MealPlanAssemblyCardProps> = ({
  meal,
  mealIndex,
  onAddFood,
  onRemoveFood,
  suggestedFoods
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredFoods = suggestedFoods.filter(
    food => food.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-nutri-gray-light pb-3">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">{meal.name} <span className="text-sm font-normal text-gray-500">({meal.time})</span></h3>
          <div className="text-right">
            <p className="font-medium">{meal.calories} kcal</p>
            <p className="text-xs text-gray-600">
              P: {meal.protein}g ({Math.round(meal.proteinPercent * 100)}%) | 
              C: {meal.carbs}g ({Math.round(meal.carbsPercent * 100)}%) | 
              G: {meal.fat}g ({Math.round(meal.fatPercent * 100)}%)
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {meal.foods.length > 0 ? (
          <div className="space-y-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Alimento</th>
                  <th className="text-left py-2">Porção</th>
                  <th className="text-left py-2">Calorias</th>
                  <th className="text-right py-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {meal.foods.map((food, foodIndex) => (
                  <tr key={foodIndex} className="border-b">
                    <td className="py-2">{food.name}</td>
                    <td className="py-2">{food.portion || '-'}</td>
                    <td className="py-2">{food.calories} kcal</td>
                    <td className="py-2 text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => onRemoveFood(mealIndex, foodIndex)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        Remover
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">Nenhum alimento adicionado</p>
        )}
        
        <div className="mt-4 pt-4 border-t">
          <h4 className="font-medium mb-2">Adicionar Alimentos</h4>
          
          <div className="mb-4 relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar alimentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
            {filteredFoods.length > 0 ? (
              filteredFoods.map((food, idx) => (
                <Button 
                  key={idx}
                  variant="outline"
                  size="sm"
                  onClick={() => onAddFood(mealIndex, food)}
                  className="justify-start overflow-hidden text-ellipsis whitespace-nowrap"
                >
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  {food.name}
                </Button>
              ))
            ) : searchTerm ? (
              <p className="text-gray-500 col-span-full text-center py-2">Nenhum alimento encontrado</p>
            ) : (
              <p className="text-gray-500 col-span-full text-center py-2">
                Digite para buscar alimentos na base de dados
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MealPlanAssemblyCard;
