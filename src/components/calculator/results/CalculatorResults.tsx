/**
 * Calculator Results Component
 * Displays nutrition calculation results
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { CalculationResult } from '@/utils/nutrition/official/officialCalculations';

interface CalculatorResultsProps {
  results: CalculationResult;
}

export const CalculatorResults: React.FC<CalculatorResultsProps> = ({ results }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resultados do Cálculo</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Badge variant="outline">TMB</Badge>
            <p className="text-2xl font-bold">{results.tmb.value} kcal</p>
            <p className="text-sm text-muted-foreground">Fórmula: {results.tmb.formula}</p>
          </div>
          
          <div>
            <Badge variant="outline">GET</Badge>
            <p className="text-2xl font-bold">{results.get} kcal</p>
          </div>
          
          <div>
            <Badge variant="outline">VET</Badge>
            <p className="text-2xl font-bold">{results.vet} kcal</p>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium">Proteína</p>
              <p className="text-lg">{results.macros.protein.grams}g</p>
              <p className="text-sm text-muted-foreground">{results.macros.protein.percentage}%</p>
            </div>
            <div>
              <p className="text-sm font-medium">Carboidrato</p>
              <p className="text-lg">{results.macros.carbs.grams}g</p>
              <p className="text-sm text-muted-foreground">{results.macros.carbs.percentage}%</p>
            </div>
            <div>
              <p className="text-sm font-medium">Gordura</p>
              <p className="text-lg">{results.macros.fat.grams}g</p>
              <p className="text-sm text-muted-foreground">{results.macros.fat.percentage}%</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CalculatorResults;
