import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Utensils, Download, Edit, Plus } from 'lucide-react';
import { useConsultationData } from '@/contexts/ConsultationDataContext';
import { MealPlanService } from '@/services/mealPlanService';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { MealPlan } from '@/types/mealPlan';

const MealPlanStep: React.FC = () => {
  const { selectedPatient, consultationData, updateConsultationData } = useConsultationData();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [existingPlans, setExistingPlans] = useState<MealPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load existing meal plans for the patient
  useEffect(() => {
    const loadMealPlans = async () => {
      if (!selectedPatient?.id) return;
      
      try {
        setIsLoading(true);
        const plans = await MealPlanService.getMealPlans(
          selectedPatient.user_id || '', 
          { patient_id: selectedPatient.id }
        );
        setExistingPlans(plans);
      } catch (error) {
        console.error('Error loading meal plans:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMealPlans();
  }, [selectedPatient]);

  const handleGenerateMealPlan = async () => {
    if (!selectedPatient || !consultationData?.results) {
      toast({
        title: 'Erro',
        description: 'Dados insuficientes para gerar plano alimentar. Complete a avaliação nutricional primeiro.',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const targets = {
        calories: consultationData.results.vet,
        protein: consultationData.results.macros.protein,
        carbs: consultationData.results.macros.carbs,
        fats: consultationData.results.macros.fat
      };

      const result = await MealPlanService.generateMealPlan(
        selectedPatient.user_id || '',
        selectedPatient.id,
        targets
      );

      if (result.success && result.data) {
        // Update consultation data with notes about meal plan
        updateConsultationData({
          notes: `Plano alimentar gerado: ${result.data.id}`
        });

        // Refresh the list of plans
        const updatedPlans = await MealPlanService.getMealPlans(
          selectedPatient.user_id || '', 
          { patient_id: selectedPatient.id }
        );
        setExistingPlans(updatedPlans);

        toast({
          title: 'Plano Alimentar Gerado',
          description: 'Plano alimentar culturalmente inteligente criado com sucesso!'
        });
      } else {
        throw new Error(result.error || 'Falha ao gerar plano alimentar');
      }
    } catch (error) {
      console.error('Error generating meal plan:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao gerar plano alimentar. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditPlan = (planId: string) => {
    navigate(`/meal-plan-editor/${planId}`);
  };

  const handleViewPlan = (planId: string) => {
    navigate(`/meal-plan-view/${planId}`);
  };

  const handleCreateManualPlan = () => {
    if (!selectedPatient) return;
    navigate('/meal-plan-generator', { 
      state: { 
        patientId: selectedPatient.id,
        consultationData 
      } 
    });
  };

  if (!selectedPatient) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Selecione um paciente para continuar</p>
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
          {/* Patient and Consultation Summary */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Paciente: {selectedPatient.name}</h3>
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

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleGenerateMealPlan}
              disabled={isGenerating || !consultationData?.results}
              className="flex-1 bg-nutri-green hover:bg-nutri-green-dark"
            >
              {isGenerating ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Gerando...
                </>
              ) : (
                <>
                  <Utensils className="mr-2 h-4 w-4" />
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

          {!consultationData?.results && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <p className="text-amber-800 dark:text-amber-200 text-sm">
                <strong>Aviso:</strong> Complete a avaliação nutricional primeiro para gerar um plano alimentar automaticamente.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Existing Meal Plans */}
      {existingPlans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Planos Existentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {existingPlans.map((plan) => (
                <div 
                  key={plan.id} 
                  className="flex items-center justify-between p-4 border rounded-lg bg-muted/20"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">
                        Plano de {new Date(plan.date).toLocaleDateString('pt-BR')}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {plan.total_calories} kcal
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      P: {plan.total_protein}g | C: {plan.total_carbs}g | G: {plan.total_fats}g
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewPlan(plan.id)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditPlan(plan.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MealPlanStep;
