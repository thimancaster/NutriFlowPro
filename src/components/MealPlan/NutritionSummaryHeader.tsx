
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface NutritionSummaryHeaderProps {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
}

const NutritionSummaryHeader: React.FC<NutritionSummaryHeaderProps> = ({
  totalCalories,
  totalProtein,
  totalCarbs,
  totalFats
}) => {
  return (
    <Card className="bg-white shadow-md">
      <CardHeader className="bg-nutri-green/5 border-b">
        <CardTitle className="text-nutri-green">Resumo do Plano</CardTitle>
        <CardDescription>Distribuição diária total de macronutrientes</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <p className="text-sm text-gray-500">Calorias</p>
            <p className="text-xl font-bold">{totalCalories} kcal</p>
          </div>
          <div className="bg-nutri-blue/5 p-3 rounded-lg text-center">
            <p className="text-sm text-gray-500">Proteínas</p>
            <p className="text-xl font-bold text-nutri-blue">{totalProtein}g</p>
            <p className="text-xs text-gray-500">{Math.round((totalProtein * 4 * 100) / totalCalories)}% do total</p>
          </div>
          <div className="bg-nutri-green/5 p-3 rounded-lg text-center">
            <p className="text-sm text-gray-500">Carboidratos</p>
            <p className="text-xl font-bold text-nutri-green">{totalCarbs}g</p>
            <p className="text-xs text-gray-500">{Math.round((totalCarbs * 4 * 100) / totalCalories)}% do total</p>
          </div>
          <div className="bg-amber-50 p-3 rounded-lg text-center">
            <p className="text-sm text-gray-500">Gorduras</p>
            <p className="text-xl font-bold text-amber-500">{totalFats}g</p>
            <p className="text-xs text-gray-500">{Math.round((totalFats * 9 * 100) / totalCalories)}% do total</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NutritionSummaryHeader;
