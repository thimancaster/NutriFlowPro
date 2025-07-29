
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Utensils, Plus } from 'lucide-react';
import { useUnifiedEcosystem } from '@/contexts/UnifiedEcosystemContext';
import { Alert, AlertDescription } from '@/components/ui/alert';

const MealPlanGenerator: React.FC = () => {
  const { 
    state, 
    generateMealPlan, 
    validateForMealPlan,
    setCurrentStep 
  } = useUnifiedEcosystem();
  
  const { 
    activePatient, 
    consultationData, 
    mealPlan, 
    isLoading, 
    error 
  } = state;
  
  const validation = validateForMealPlan();

  const handleGeneratePlan = async () => {
    await generateMealPlan();
  };

  if (!activePatient) {
    return (
      <Card>
        <CardContent className="p-6 text-center space-y-4">
          <AlertCircle className="h-12 w-12 mx-auto text-amber-500" />
          <p className="text-muted-foreground">Selecione um paciente para continuar</p>
          <Button onClick={() => setCurrentStep('patient-selection')}>
            Selecionar Paciente
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gerador de Plano Alimentar</h1>
        <p className="text-gray-600">Gere planos alimentares inteligentes baseados nos dados nutricionais</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5 text-nutri-green" />
            Plano para {activePatient.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!validation.isValid && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Problemas encontrados: {validation.issues.join('. ')}
              </AlertDescription>
            </Alert>
          )}

          {consultationData?.results && (
            <div className="bg-muted/30 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Dados Nutricionais</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">VET:</span> {consultationData.results.vet} kcal/dia
                </div>
                <div>
                  <span className="font-medium">Proteínas:</span> {consultationData.results.macros.protein}g
                </div>
                <div>
                  <span className="font-medium">Carboidratos:</span> {consultationData.results.macros.carbs}g
                </div>
                <div>
                  <span className="font-medium">Gorduras:</span> {consultationData.results.macros.fat}g
                </div>
              </div>
            </div>
          )}

          {mealPlan ? (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-800 mb-2">
                ✅ Plano Alimentar Gerado
              </h4>
              <p className="text-sm text-green-600">
                {mealPlan.total_calories} kcal distribuídas em {mealPlan.meals.length} refeições
              </p>
              <div className="mt-4">
                {mealPlan.meals.map((meal, index) => (
                  <div key={index} className="mb-2 p-2 bg-white rounded border">
                    <div className="font-medium">{meal.name}</div>
                    <div className="text-xs text-gray-600">
                      {meal.calories} kcal | P: {meal.protein}g | C: {meal.carbs}g | G: {meal.fats}g
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handleGeneratePlan}
                disabled={isLoading || !validation.isValid}
                className="flex-1 bg-nutri-green hover:bg-nutri-green-dark"
              >
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Gerando Plano...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Gerar Plano Alimentar
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MealPlanGenerator;
