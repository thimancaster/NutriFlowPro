
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { MealDistributionItem } from '@/types/meal';
import { PlusCircle, Trash2 } from 'lucide-react';
import { mealOptions } from '@/utils/mealGeneratorUtils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MealPlanFormProps {
  mealDistribution?: Record<string, MealDistributionItem>;
  totalMealPercent: number;
  onMealPercentChange: (mealKey: string, newValue: number[]) => void;
  onAddMeal?: () => void;
  onRemoveMeal?: (mealKey: string) => void;
  onChangeMealName?: (mealKey: string, newName: string) => void;
}

const MealPlanForm = ({ 
  mealDistribution, 
  totalMealPercent, 
  onMealPercentChange,
  onAddMeal,
  onRemoveMeal,
  onChangeMealName
}: MealPlanFormProps) => {
  if (!mealDistribution) return null;
  
  const mealKeys = Object.keys(mealDistribution);
  
  return (
    <div>
      <div className="flex items-center justify-between mb-4 mt-6">
        <h3 className="text-lg font-semibold">Distribuição das Refeições</h3>
        {onAddMeal && (
          <Button 
            variant="outline"
            onClick={onAddMeal}
            className="flex items-center gap-1"
          >
            <PlusCircle className="h-4 w-4" />
            Adicionar Refeição
          </Button>
        )}
      </div>
      
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Refeição</span>
        <span className={`text-sm font-medium ${totalMealPercent === 100 ? 'text-green-600' : 'text-red-500'}`}>
          Total: {totalMealPercent}%
        </span>
      </div>
      
      <Card className="divide-y">
        {mealKeys.map((mealKey) => {
          const meal = mealDistribution[mealKey];
          return (
            <div key={mealKey} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1">
                  {onChangeMealName ? (
                    <div className="w-48 mb-2">
                      <Select 
                        value={meal.name} 
                        onValueChange={(value) => onChangeMealName(mealKey, value)}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="Selecione a refeição" />
                        </SelectTrigger>
                        <SelectContent>
                          {mealOptions.map((option) => (
                            <SelectItem key={option.id} value={option.name}>
                              {option.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <h4 className="font-medium text-nutri-blue">{meal.name}</h4>
                  )}
                  <div className="text-sm text-gray-500 mt-1">
                    <span className="mr-2">{meal.calories} kcal</span>
                    <span className="mr-2">{meal.protein}g prot</span>
                    <span className="mr-2">{meal.carbs}g carb</span>
                    <span>{meal.fat}g gord</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg text-nutri-green">{meal.percent}%</span>
                  {onRemoveMeal && mealKeys.length > 3 && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => onRemoveMeal(mealKey)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="pt-2">
                <Slider 
                  value={[meal.percent]} 
                  min={5} 
                  max={60} 
                  step={5} 
                  onValueChange={(value) => onMealPercentChange(mealKey, value)}
                  className="cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>5%</span>
                  <span>60%</span>
                </div>
              </div>
            </div>
          );
        })}
      </Card>
      
      {totalMealPercent !== 100 && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-700 text-sm">
          <strong>Nota:</strong> A distribuição total das refeições deve ser exatamente 100%. 
          Atual: {totalMealPercent}%
        </div>
      )}
      
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">Sugestões de Alimentos</h3>
        <Card className="p-4">
          <div className="space-y-6">
            {mealKeys.map((mealKey) => {
              const meal = mealDistribution[mealKey];
              return (
                <div key={`suggestions-${mealKey}`} className="border-b pb-4 last:border-0 last:pb-0">
                  <h4 className="font-medium mb-2">{meal.name}</h4>
                  <div className="flex flex-wrap gap-2">
                    {meal.suggestions?.map((food, index) => (
                      <span 
                        key={index} 
                        className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full"
                      >
                        {food}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MealPlanForm;
