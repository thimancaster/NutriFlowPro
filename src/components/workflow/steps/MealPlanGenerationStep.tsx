
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Utensils, CheckCircle, Clock } from 'lucide-react';
import { useConsultationData } from '@/contexts/ConsultationDataContext';
import { usePatient } from '@/contexts/patient/PatientContext';
import { useToast } from '@/hooks/use-toast';

interface MealPlanGenerationStepProps {
  onMealPlanComplete: () => void;
}

export const MealPlanGenerationStep: React.FC<MealPlanGenerationStepProps> = ({ onMealPlanComplete }) => {
  const { consultationData } = useConsultationData();
  const { activePatient } = usePatient();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  // Distribuição padrão das refeições (conforme especificação)
  const mealDistribution = [
    { name: 'Café da manhã', percentage: 25 },
    { name: 'Lanche manhã', percentage: 10 },
    { name: 'Almoço', percentage: 30 },
    { name: 'Lanche tarde', percentage: 10 },
    { name: 'Jantar', percentage: 20 },
    { name: 'Ceia', percentage: 5 }
  ];

  const handleGenerateMealPlan = async () => {
    if (!consultationData?.results) {
      toast({
        title: "Erro",
        description: "Complete os cálculos nutricionais primeiro.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    // Simular geração do plano alimentar
    setTimeout(() => {
      setIsGenerating(false);
      toast({
        title: "Plano Alimentar Gerado",
        description: "O cardápio foi criado com base nos cálculos nutricionais.",
      });
      onMealPlanComplete();
    }, 2000);
  };

  const calculateMealCalories = (percentage: number) => {
    if (!consultationData?.results) return 0;
    return Math.round((consultationData.results.vet * percentage) / 100);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Geração do Plano Alimentar</h2>
        <p className="text-muted-foreground">
          Criação do cardápio personalizado baseado nos cálculos nutricionais
        </p>
      </div>

      {/* Resumo Nutricional */}
      {consultationData?.results && (
        <Card>
          <CardHeader>
            <CardTitle>Resumo dos Cálculos Nutricionais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">VET</p>
                <p className="text-2xl font-bold text-primary">{consultationData.results.vet} kcal</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Proteínas</p>
                <p className="text-xl font-semibold text-red-600">
                  {consultationData.results.macros.protein}g
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Carboidratos</p>
                <p className="text-xl font-semibold text-yellow-600">
                  {consultationData.results.macros.carbs}g
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gorduras</p>
                <p className="text-xl font-semibold text-blue-600">
                  {consultationData.results.macros.fat}g
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Distribuição das Refeições */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5" />
            Distribuição das Refeições
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mealDistribution.map((meal, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">{meal.name}</p>
                  <p className="text-sm text-muted-foreground">{meal.percentage}% do VET</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{calculateMealCalories(meal.percentage)} kcal</p>
                  <Badge variant="secondary">{meal.percentage}%</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ações */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            {isGenerating ? (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <Clock className="h-5 w-5 animate-spin" />
                  <p>Gerando plano alimentar personalizado...</p>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full animate-pulse w-3/4"></div>
                </div>
              </div>
            ) : (
              <Button 
                onClick={handleGenerateMealPlan}
                size="lg"
                className="w-full"
                disabled={!consultationData?.results}
              >
                <Utensils className="mr-2 h-5 w-5" />
                Gerar Plano Alimentar Completo
              </Button>
            )}
            
            <p className="text-sm text-muted-foreground">
              O plano será gerado com 6 refeições distribuídas conforme os percentuais padrão
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
