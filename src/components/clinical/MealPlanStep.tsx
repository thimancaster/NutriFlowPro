import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Utensils, Download, Edit, Plus, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { usePatient } from '@/contexts/patient/PatientContext';
import { useConsultationData } from '@/contexts/ConsultationDataContext';
import { MealPlanService } from '@/services/mealPlanService';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MealPlan } from '@/types/mealPlan';

const MealPlanStep: React.FC = () => {
  const { user } = useAuth();
  const { activePatient } = usePatient();
  const { consultationData } = useConsultationData();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [existingPlans, setExistingPlans] = useState<MealPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load existing meal plans for the patient
  useEffect(() => {
    const loadMealPlans = async () => {
      if (!activePatient?.id || !user?.id) {
        console.log('Missing required data for loading meal plans:', {
          hasPatient: !!activePatient,
          patientId: activePatient?.id,
          hasUser: !!user,
          userId: user?.id
        });
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        console.log('Loading meal plans for patient:', activePatient.id, 'user:', user.id);
        
        const plans = await MealPlanService.getMealPlans(
          user.id, 
          { patient_id: activePatient.id }
        );
        setExistingPlans(plans);
        console.log('Loaded meal plans:', plans.length);
      } catch (error) {
        console.error('Error loading meal plans:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os planos alimentares existentes',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadMealPlans();
  }, [activePatient?.id, user?.id, toast]);

  const handleGenerateMealPlan = async () => {
    if (!user?.id || !activePatient?.id) {
      toast({
        title: 'Erro de Validação',
        description: 'Usuário ou paciente não identificado',
        variant: 'destructive'
      });
      return;
    }

    if (!consultationData?.results) {
      toast({
        title: 'Dados Incompletos',
        description: 'Complete a avaliação nutricional primeiro para gerar um plano alimentar',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      console.log('Generating meal plan with data:', {
        userId: user.id,
        patientId: activePatient.id,
        targets: {
          calories: consultationData.results.vet,
          protein: consultationData.results.macros.protein,
          carbs: consultationData.results.macros.carbs,
          fats: consultationData.results.macros.fat
        }
      });

      const result = await MealPlanService.generateMealPlan(
        user.id,
        activePatient.id,
        {
          calories: consultationData.results.vet,
          protein: consultationData.results.macros.protein,
          carbs: consultationData.results.macros.carbs,
          fats: consultationData.results.macros.fat
        }
      );

      if (result.success && result.data) {
        console.log('Meal plan generated successfully:', result.data.id);
        
        // Refresh the list of plans
        const updatedPlans = await MealPlanService.getMealPlans(
          user.id, 
          { patient_id: activePatient.id }
        );
        setExistingPlans(updatedPlans);

        toast({
          title: 'Sucesso! 🇧🇷',
          description: 'Plano alimentar culturalmente inteligente criado com sucesso!'
        });
      } else {
        throw new Error(result.error || 'Falha ao gerar plano alimentar');
      }
    } catch (error: any) {
      console.error('Error generating meal plan:', error);
      
      let errorMessage = 'Erro inesperado ao gerar plano alimentar';
      
      if (error.message?.includes('UUID')) {
        errorMessage = 'Erro de identificação do usuário. Tente fazer logout e login novamente.';
      } else if (error.message?.includes('calorias')) {
        errorMessage = error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Erro na Geração',
        description: errorMessage,
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
    if (!activePatient || !user?.id) {
      toast({
        title: 'Erro',
        description: 'Dados necessários não disponíveis para criar plano manual',
        variant: 'destructive'
      });
      return;
    }
    
    navigate('/meal-plan-workflow', { 
      state: { 
        patientData: activePatient,
        calculationData: consultationData
      } 
    });
  };

  if (!activePatient) {
    return (
      <Card>
        <CardContent className="p-6 text-center space-y-4">
          <AlertCircle className="h-12 w-12 mx-auto text-gray-300" />
          <p className="text-muted-foreground">Selecione um paciente para continuar</p>
          <Button onClick={() => navigate('/patients')}>
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
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Aviso:</strong> Complete a avaliação nutricional primeiro para gerar um plano alimentar automaticamente.
              </AlertDescription>
            </Alert>
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
                        {Math.round(plan.total_calories)} kcal
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      P: {Math.round(plan.total_protein)}g | C: {Math.round(plan.total_carbs)}g | G: {Math.round(plan.total_fats)}g
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
