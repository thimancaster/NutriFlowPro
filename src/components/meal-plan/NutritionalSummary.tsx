
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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

  const getStatusColor = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage < 80) return 'text-orange-600';
    if (percentage > 120) return 'text-red-600';
    return 'text-green-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumo Nutricional</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Calories */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Calorias</span>
              {current && (
                <Badge variant="outline" className={getStatusColor(current.calories, targets.calories)}>
                  {((current.calories / targets.calories) * 100).toFixed(0)}%
                </Badge>
              )}
            </div>
            {current && (
              <Progress
                value={calculatePercentage(current.calories, targets.calories)}
                className="h-2"
              />
            )}
            <div className="text-center">
              <div className="text-lg font-semibold">
                {current ? current.calories.toFixed(0) : '0'} / {targets.calories.toFixed(0)}
              </div>
              <div className="text-xs text-gray-500">kcal</div>
            </div>
          </div>

          {/* Protein */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Proteínas</span>
              {current && (
                <Badge variant="outline" className={getStatusColor(current.protein, targets.protein)}>
                  {((current.protein / targets.protein) * 100).toFixed(0)}%
                </Badge>
              )}
            </div>
            {current && (
              <Progress
                value={calculatePercentage(current.protein, targets.protein)}
                className="h-2"
              />
            )}
            <div className="text-center">
              <div className="text-lg font-semibold">
                {current ? current.protein.toFixed(0) : '0'} / {targets.protein.toFixed(0)}
              </div>
              <div className="text-xs text-gray-500">g</div>
            </div>
          </div>

          {/* Carbs */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Carboidratos</span>
              {current && (
                <Badge variant="outline" className={getStatusColor(current.carbs, targets.carbs)}>
                  {((current.carbs / targets.carbs) * 100).toFixed(0)}%
                </Badge>
              )}
            </div>
            {current && (
              <Progress
                value={calculatePercentage(current.carbs, targets.carbs)}
                className="h-2"
              />
            )}
            <div className="text-center">
              <div className="text-lg font-semibold">
                {current ? current.carbs.toFixed(0) : '0'} / {targets.carbs.toFixed(0)}
              </div>
              <div className="text-xs text-gray-500">g</div>
            </div>
          </div>

          {/* Fats */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Gorduras</span>
              {current && (
                <Badge variant="outline" className={getStatusColor(current.fats, targets.fats)}>
                  {((current.fats / targets.fats) * 100).toFixed(0)}%
                </Badge>
              )}
            </div>
            {current && (
              <Progress
                value={calculatePercentage(current.fats, targets.fats)}
                className="h-2"
              />
            )}
            <div className="text-center">
              <div className="text-lg font-semibold">
                {current ? current.fats.toFixed(0) : '0'} / {targets.fats.toFixed(0)}
              </div>
              <div className="text-xs text-gray-500">g</div>
            </div>
          </div>
        </div>

        {current && (
          <div className="mt-4 pt-4 border-t">
            <div className="text-sm text-gray-600 text-center">
              {current.calories < targets.calories * 0.8 && (
                <p className="text-orange-600">⚠️ Calorias abaixo do recomendado</p>
              )}
              {current.calories > targets.calories * 1.2 && (
                <p className="text-red-600">⚠️ Calorias acima do recomendado</p>
              )}
              {current.calories >= targets.calories * 0.8 && current.calories <= targets.calories * 1.2 && (
                <p className="text-green-600">✅ Valores dentro da meta nutricional</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NutritionalSummary;
