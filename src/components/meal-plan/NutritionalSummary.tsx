
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Target, TrendingUp } from 'lucide-react';

interface MacroTargets {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface NutritionalSummaryProps {
  targets: MacroTargets;
  current?: MacroTargets;
}

const NutritionalSummary: React.FC<NutritionalSummaryProps> = ({ targets, current }) => {
  const calculatePercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getStatusColor = (percentage: number) => {
    if (percentage >= 95 && percentage <= 105) return 'text-green-600';
    if (percentage >= 85 && percentage <= 115) return 'text-yellow-600';
    return 'text-red-600';
  };

  const macros = [
    {
      name: 'Calorias',
      target: targets.calories,
      current: current?.calories || 0,
      unit: 'kcal',
      color: 'bg-nutri-green'
    },
    {
      name: 'Proteínas',
      target: targets.protein,
      current: current?.protein || 0,
      unit: 'g',
      color: 'bg-blue-500'
    },
    {
      name: 'Carboidratos',
      target: targets.carbs,
      current: current?.carbs || 0,
      unit: 'g',
      color: 'bg-orange-500'
    },
    {
      name: 'Gorduras',
      target: targets.fats,
      current: current?.fats || 0,
      unit: 'g',
      color: 'bg-purple-500'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-nutri-green" />
          Resumo Nutricional
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {macros.map((macro) => {
            const percentage = calculatePercentage(macro.current, macro.target);
            const isComplete = current !== undefined;
            
            return (
              <div key={macro.name} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{macro.name}</span>
                  <div className="flex items-center gap-2">
                    {isComplete ? (
                      <Badge 
                        variant="secondary" 
                        className={getStatusColor(percentage)}
                      >
                        {macro.current} / {macro.target} {macro.unit}
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        Meta: {macro.target} {macro.unit}
                      </Badge>
                    )}
                  </div>
                </div>
                
                {isComplete && (
                  <div className="space-y-1">
                    <Progress 
                      value={percentage} 
                      className="h-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{percentage.toFixed(1)}% da meta</span>
                      <span className={getStatusColor(percentage)}>
                        {percentage >= 95 && percentage <= 105 ? '✓ Ideal' : 
                         percentage >= 85 && percentage <= 115 ? '⚠ Aceitável' : 
                         '✗ Ajustar'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {current && (
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-nutri-green" />
              <span className="font-medium">Status Geral</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Plano alimentar balanceado seguindo padrões brasileiros de alimentação
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NutritionalSummary;
