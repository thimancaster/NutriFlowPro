
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Utensils, Calendar, RefreshCw } from 'lucide-react';
import { usePatient } from '@/contexts/patient/PatientContext';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useMealPlanGeneration } from '@/hooks/useMealPlanGeneration';
import { NutritionalTargets, BRAZILIAN_MEAL_FOOD_MAPPING } from '@/types/mealPlan';
import MealPlanEditor from './MealPlanEditor';
import NutritionalSummary from './NutritionalSummary';
import PatientRequiredAlert from './PatientRequiredAlert';

interface MealPlanGeneratorProps {
  calculationData?: {
    tdee: number;
    protein: number;
    carbs: number;
    fats: number;
  };
}

const MealPlanGenerator: React.FC<MealPlanGeneratorProps> = ({ calculationData }) => {
  const { activePatient } = usePatient();
  const { user } = useAuth();
  const { isGenerating, generatedPlan, generateMealPlan } = useMealPlanGeneration();
  const [targets, setTargets] = useState<NutritionalTargets>({
    calories: 2000,
    protein: 150,
    carbs: 200,
    fats: 67
  });

  // Atualizar targets quando dados de cálculo estiverem disponíveis
  useEffect(() => {
    if (calculationData) {
      setTargets({
        calories: calculationData.tdee,
        protein: calculationData.protein,
        carbs: calculationData.carbs,
        fats: calculationData.fats
      });
    }
  }, [calculationData]);

  const handleGeneratePlan = async () => {
    if (!activePatient || !user) return;

    await generateMealPlan({
      userId: user.id,
      patientId: activePatient.id,
      targets,
      mealTimeFoodMapping: BRAZILIAN_MEAL_FOOD_MAPPING // Usa mapeamento cultural brasileiro
    });
  };

  if (!activePatient) {
    return <PatientRequiredAlert />;
  }

  if (!generatedPlan) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="h-5 w-5" />
              Gerador de Plano Alimentar com Inteligência Cultural
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">
                  Paciente: {activePatient.name}
                </h3>
                <p className="text-gray-600">
                  Gere automaticamente um plano alimentar personalizado seguindo 
                  os costumes alimentares brasileiros
                </p>
              </div>

              <NutritionalSummary targets={targets} />

              <div className="mt-6">
                <Button 
                  onClick={handleGeneratePlan}
                  disabled={isGenerating}
                  size="lg"
                  className="w-full max-w-md"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Gerando plano inteligente...
                    </>
                  ) : (
                    <>
                      <Calendar className="mr-2 h-4 w-4" />
                      Gerar Plano Alimentar Brasileiro
                    </>
                  )}
                </Button>
              </div>

              <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-sm text-green-800">
                  <p className="font-medium mb-2">🧠 Inteligência Cultural Brasileira:</p>
                  <ul className="text-left space-y-1">
                    <li>• Café da manhã: Pães, cereais, frutas e laticínios</li>
                    <li>• Almoço: Arroz, feijão, carnes e verduras</li>
                    <li>• Jantar: Refeições mais leves e saudáveis</li>
                    <li>• Lanches: Frutas, iogurtes e oleaginosas</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Plano Alimentar Brasileiro - {activePatient.name}</h2>
        <Button 
          onClick={handleGeneratePlan} 
          variant="outline"
          disabled={isGenerating}
        >
          {isGenerating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Gerar Novo Plano
        </Button>
      </div>

      <NutritionalSummary 
        targets={targets} 
        current={{
          calories: generatedPlan.total_calories,
          protein: generatedPlan.total_protein,
          carbs: generatedPlan.total_carbs,
          fats: generatedPlan.total_fats
        }}
      />

      <MealPlanEditor mealPlan={generatedPlan} />
    </div>
  );
};

export default MealPlanGenerator;
