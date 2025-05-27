
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { NutritionalTargets } from '@/types/mealPlan';

interface NutritionalSummaryProps {
  targets: NutritionalTargets;
  current?: NutritionalTargets;
}

const NutritionalSummary: React.FC<NutritionalSummaryProps> = ({
  targets,
  current
}) => {
  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getVarianceColor = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage < 90) return 'text-red-500';
    if (percentage > 110) return 'text-orange-500';
    return 'text-green-500';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumo Nutricional</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Calorias */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Calorias</span>
              <Badge variant="outline">kcal</Badge>
            </div>
            {current ? (
              <>
                <div className="flex items-center justify-between text-sm">
                  <span className={getVarianceColor(current.calories, targets.calories)}>
                    {current.calories.toFixed(0)}
                  </span>
                  <span className="text-gray-500">
                    / {targets.calories.toFixed(0)}
                  </span>
                </div>
                <Progress 
                  value={getProgressPercentage(current.calories, targets.calories)}
                  className="h-2"
                />
              </>
            ) : (
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {targets.calories.toFixed(0)}
                </div>
              </div>
            )}
          </div>

          {/* Proteínas */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Proteínas</span>
              <Badge variant="outline">g</Badge>
            </div>
            {current ? (
              <>
                <div className="flex items-center justify-between text-sm">
                  <span className={getVarianceColor(current.protein, targets.protein)}>
                    {current.protein.toFixed(0)}
                  </span>
                  <span className="text-gray-500">
                    / {targets.protein.toFixed(0)}
                  </span>
                </div>
                <Progress 
                  value={getProgressPercentage(current.protein, targets.protein)}
                  className="h-2"
                />
              </>
            ) : (
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {targets.protein.toFixed(0)}
                </div>
              </div>
            )}
          </div>

          {/* Carboidratos */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Carboidratos</span>
              <Badge variant="outline">g</Badge>
            </div>
            {current ? (
              <>
                <div className="flex items-center justify-between text-sm">
                  <span className={getVarianceColor(current.carbs, targets.carbs)}>
                    {current.carbs.toFixed(0)}
                  </span>
                  <span className="text-gray-500">
                    / {targets.carbs.toFixed(0)}
                  </span>
                </div>
                <Progress 
                  value={getProgressPercentage(current.carbs, targets.carbs)}
                  className="h-2"
                />
              </>
            ) : (
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {targets.carbs.toFixed(0)}
                </div>
              </div>
            )}
          </div>

          {/* Gorduras */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Gorduras</span>
              <Badge variant="outline">g</Badge>
            </div>
            {current ? (
              <>
                <div className="flex items-center justify-between text-sm">
                  <span className={getVarianceColor(current.fats, targets.fats)}>
                    {current.fats.toFixed(0)}
                  </span>
                  <span className="text-gray-500">
                    / {targets.fats.toFixed(0)}
                  </span>
                </div>
                <Progress 
                  value={getProgressPercentage(current.fats, targets.fats)}
                  className="h-2"
                />
              </>
            ) : (
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {targets.fats.toFixed(0)}
                </div>
              </div>
            )}
          </div>
        </div>

        {current && (
          <div className="mt-4 text-sm text-gray-600 text-center">
            <p>
              Valores atuais vs. metas nutricionais diárias
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NutritionalSummary;
