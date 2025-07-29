
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Utensils, AlertCircle, Plus, Calendar } from 'lucide-react';
import { useUnifiedEcosystem } from '@/contexts/UnifiedEcosystemContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';

const MealPlanStep: React.FC = () => {
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
  
  const navigate = useNavigate();
  const validation = validateForMealPlan();

  const handleGeneratePlan = async () => {
    await generateMealPlan();
  };

  const handleViewMealPlan = () => {
    navigate('/meal-plan-generator');
  };

  const handleCreateManualPlan = () => {
    navigate('/meal-plan-generator');
  };

  if (!activePatient) {
    return (
      <Card>
        <CardContent className="p-6 text-center space-y-4">
          <AlertCircle className="h-12 w-12 mx-auto text-amber-500" />
          <p className="text-muted-foreground">Selecione um paciente para continuar</p>
          <Button onClick={() => setCurrentStep('patient')}>
            Selecionar Paciente
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5 text-nutri-green" />
            Plano Alimentar
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

          {/* Patient and Consultation Summary */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Paciente: {activePatient.name}</h3>
            {consultationData?.results && (
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
            )}
          </div>

          {/* Meal Plan Status */}
          {mealPlan ? (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-green-800">
                    ✅ Plano Alimentar Gerado
                  </h4>
                  <p className="text-sm text-green-600">
                    {mealPlan.total_calories} kcal distribuídas em {mealPlan.meals.length} refeições
                  </p>
                </div>
                <Button 
                  onClick={handleViewMealPlan}
                  variant="outline"
                  size="sm"
                >
                  Ver Plano
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <h4 className="font-medium text-amber-800">
                ⏳ Plano Alimentar Pendente
              </h4>
              <p className="text-sm text-amber-600">
                Nenhum plano alimentar foi gerado ainda
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleGeneratePlan}
              disabled={isLoading || !validation.isValid}
              className="flex-1 bg-nutri-green hover:bg-nutri-green-dark"
            >
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Gerando...
                </>
              ) : (
                <>
                  <Calendar className="mr-2 h-4 w-4" />
                  Gerar Plano Inteligente
                </>
              )}
            </Button>

            <Button 
              variant="outline" 
              onClick={handleCreateManualPlan}
              className="flex-1"
            >
              <Plus className="mr-2 h-4 w-4" />
              Criar Manualmente
            </Button>
          </div>

          {!validation.isValid && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <p className="text-amber-800 dark:text-amber-200 text-sm">
                <strong>Aviso:</strong> Complete a avaliação nutricional primeiro para gerar um plano alimentar automaticamente.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MealPlanStep;
