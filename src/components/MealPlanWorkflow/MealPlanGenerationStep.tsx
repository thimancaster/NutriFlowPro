
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Utensils, Target } from 'lucide-react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useMealPlanWorkflow } from '@/contexts/MealPlanWorkflowContext';

const MealPlanGenerationStep: React.FC = () => {
  const { user } = useAuth();
  const {
    patient,
    calculationData,
    isGenerating,
    generateMealPlan
  } = useMealPlanWorkflow();

  const handleGenerate = async () => {
    if (user) {
      await generateMealPlan(user.id);
    }
  };

  if (!calculationData) return null;

  return (
    <div className="space-y-6">
      {/* Nutritional Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Metas Nutricionais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {calculationData.totalCalories || 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Calorias (kcal)</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {calculationData.protein || 'N/A'}g
              </div>
              <div className="text-sm text-gray-600">Proteína</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {calculationData.carbs || 'N/A'}g
              </div>
              <div className="text-sm text-gray-600">Carboidratos</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {calculationData.fats || 'N/A'}g
              </div>
              <div className="text-sm text-gray-600">Gorduras</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generation Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5" />
            Gerar Plano Alimentar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-gray-600 mb-6">
              O sistema irá gerar automaticamente um plano alimentar balanceado 
              baseado nos cálculos nutricionais realizados para <strong>{patient?.name}</strong>.
            </p>
            
            <Button 
              onClick={handleGenerate}
              disabled={isGenerating}
              size="lg"
              className="w-full max-w-md"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Gerando plano alimentar...
                </>
              ) : (
                <>
                  <Utensils className="mr-2 h-5 w-5" />
                  Gerar Plano Alimentar Automático
                </>
              )}
            </Button>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">O que será gerado:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Distribuição em 6 refeições (café, lanche manhã, almoço, lanche tarde, jantar, ceia)</li>
              <li>• Alimentos balanceados por refeição</li>
              <li>• Quantidades calculadas automaticamente</li>
              <li>• Possibilidade de edição e personalização posterior</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MealPlanGenerationStep;
