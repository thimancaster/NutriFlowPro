
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { NutritionalTargets } from '@/types/mealPlan';

interface NutritionalSummaryProps {
  targets: NutritionalTargets;
  current?: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
}

const NutritionalSummary: React.FC<NutritionalSummaryProps> = ({ targets, current }) => {
  const calculatePercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage < 80) return 'bg-red-500';
    if (percentage < 95) return 'bg-yellow-500';
    if (percentage <= 110) return 'bg-green-500';
    return 'bg-orange-500';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumo Nutricional</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {current ? Math.round(current.calories) : 0}
            </div>
            <div className="text-sm text-gray-600">/ {Math.round(targets.calories)} kcal</div>
            <div className="text-xs text-gray-500 mt-1">Calorias</div>
            {current && (
              <Progress 
                value={calculatePercentage(current.calories, targets.calories)} 
                className="mt-2 h-2"
              />
            )}
          </div>
          
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {current ? Math.round(current.protein) : 0}
            </div>
            <div className="text-sm text-gray-600">/ {Math.round(targets.protein)}g</div>
            <div className="text-xs text-gray-500 mt-1">Proteínas</div>
            {current && (
              <Progress 
                value={calculatePercentage(current.protein, targets.protein)} 
                className="mt-2 h-2"
              />
            )}
          </div>
          
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {current ? Math.round(current.carbs) : 0}
            </div>
            <div className="text-sm text-gray-600">/ {Math.round(targets.carbs)}g</div>
            <div className="text-xs text-gray-500 mt-1">Carboidratos</div>
            {current && (
              <Progress 
                value={calculatePercentage(current.carbs, targets.carbs)} 
                className="mt-2 h-2"
              />
            )}
          </div>
          
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {current ? Math.round(current.fats) : 0}
            </div>
            <div className="text-sm text-gray-600">/ {Math.round(targets.fats)}g</div>
            <div className="text-xs text-gray-500 mt-1">Gorduras</div>
            {current && (
              <Progress 
                value={calculatePercentage(current.fats, targets.fats)} 
                className="mt-2 h-2"
              />
            )}
          </div>
        </div>
        
        {current && (
          <div className="flex justify-center gap-2 mt-4">
            <Badge variant="outline">
              {Math.round(calculatePercentage(current.calories, targets.calories))}% das metas
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NutritionalSummary;
