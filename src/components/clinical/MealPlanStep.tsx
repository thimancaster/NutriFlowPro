
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Utensils } from 'lucide-react';
import { MealPlan } from '@/types/mealPlan';
import { MealPlanService } from '@/services/mealPlanService';
import { useConsultation } from '@/contexts/ConsultationContext';
import { toast } from '@/hooks/use-toast';

interface MealPlanStepProps {
  patientId: string;
  onNext: () => void;
  onPrev: () => void;
}

const MealPlanStep: React.FC<MealPlanStepProps> = ({ patientId, onNext, onPrev }) => {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [selectedMealPlan, setSelectedMealPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const { setMealPlan } = useConsultation();

  useEffect(() => {
    loadMealPlans();
  }, [patientId]);

  const loadMealPlans = async () => {
    if (!patientId) return;
    
    setLoading(true);
    try {
      const result = await MealPlanService.getMealPlans(patientId, { 
        patient_id: patientId,
        limit: 10 
      });
      
      if (result.success && result.data) {
        setMealPlans(result.data);
        
        // Auto-select the most recent meal plan if available
        if (result.data.length > 0) {
          const mostRecent = result.data[0];
          setSelectedMealPlan(mostRecent);
          setMealPlan(mostRecent);
        }
      } else {
        toast({
          title: "Erro ao carregar planos",
          description: result.error || "Não foi possível carregar os planos alimentares",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Error loading meal plans:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar planos alimentares",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateNewMealPlan = async () => {
    if (!patientId) return;
    
    setGenerating(true);
    try {
      // Fix: Pass the correct parameters as expected by the service
      const result = await MealPlanService.generateMealPlan(
        "user-id", // userId - should come from auth context in real app
        patientId, // patientId
        { calories: 2000, protein: 150, carbs: 250, fats: 67 } // MacroTargets object
      );
      
      if (result.success && result.data) {
        setSelectedMealPlan(result.data);
        setMealPlan(result.data);
        
        // Reload the list to include the new meal plan
        await loadMealPlans();
        
        toast({
          title: "Plano gerado!",
          description: "Novo plano alimentar criado com sucesso",
        });
      } else {
        toast({
          title: "Erro ao gerar plano",
          description: result.error || "Não foi possível gerar o plano alimentar",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Error generating meal plan:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar plano alimentar",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleMealPlanSelect = (mealPlan: MealPlan) => {
    setSelectedMealPlan(mealPlan);
    setMealPlan(mealPlan);
  };

  const handleNext = () => {
    if (selectedMealPlan) {
      setMealPlan(selectedMealPlan);
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5" />
            Plano Alimentar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={generateNewMealPlan}
              disabled={generating}
              className="flex items-center gap-2"
            >
              {generating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Utensils className="h-4 w-4" />
              )}
              {generating ? "Gerando..." : "Gerar Novo Plano"}
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {mealPlans.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  Nenhum plano alimentar encontrado. Clique em "Gerar Novo Plano" para começar.
                </p>
              ) : (
                mealPlans.map((mealPlan) => (
                  <Card 
                    key={mealPlan.id} 
                    className={`cursor-pointer transition-colors ${
                      selectedMealPlan?.id === mealPlan.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleMealPlanSelect(mealPlan)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">
                            {(mealPlan as any).name || 'Plano Alimentar'}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {Math.round(mealPlan.total_calories)} kcal
                          </p>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(mealPlan.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev}>
          Anterior
        </Button>
        <Button onClick={handleNext} disabled={!selectedMealPlan}>
          Próximo
        </Button>
      </div>
    </div>
  );
};

export default MealPlanStep;
