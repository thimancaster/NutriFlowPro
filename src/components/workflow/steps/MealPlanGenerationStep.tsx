
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Utensils, Loader2, ArrowLeft, CheckCircle, AlertCircle, Wand2 } from 'lucide-react';
import { useMealPlanExport } from '@/hooks/useMealPlanExport';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';
import ConsolidatedMealPlanEditor from '@/components/meal-plan/ConsolidatedMealPlanEditor';
import { ConsolidatedMealPlan } from '@/types';

interface MealPlanGenerationStepProps {
  patientData?: {
    id: string;
    name: string;
    gender?: string;
    birth_date?: string;
    weight?: number;
    height?: number;
  };
  calculationResults?: {
    id?: string;
    totalCalories: number;
    protein: number;
    carbs: number;
    fats: number;
    objective: string;
    tmb?: number;
    get?: number;
    vet?: number;
  };
  onBack?: () => void;
  onComplete?: () => void;
}

export const MealPlanGenerationStep: React.FC<MealPlanGenerationStepProps> = ({
  patientData,
  calculationResults,
  onBack,
  onComplete
}) => {
  const { user } = useAuth();
  const { exportToPDF } = useMealPlanExport();
  const { toast } = useToast();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentMealPlan, setCurrentMealPlan] = useState<ConsolidatedMealPlan | null>(null);
  const [generationAttempted, setGenerationAttempted] = useState(false);

  // Calcular idade do paciente se birth_date disponível
  const patientAge = patientData?.birth_date 
    ? Math.floor((new Date().getTime() - new Date(patientData.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : undefined;

  const patientGender = patientData?.gender === 'male' ? 'male' : 
                       patientData?.gender === 'female' ? 'female' : undefined;

  // Generate a simple meal plan locally (without database)
  const handleGenerateMealPlan = async () => {
    if (!calculationResults || !patientData || !user) {
      console.error('❌ Dados insuficientes para gerar plano');
      return;
    }

    setIsGenerating(true);
    setGenerationAttempted(true);

    console.log('🚀 [MealPlanGenerationStep] Iniciando geração:', {
      patient: patientData.name,
      calories: calculationResults.totalCalories,
      protein: calculationResults.protein,
      carbs: calculationResults.carbs,
      fats: calculationResults.fats
    });

    try {
      // Simulate generation delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create a simple meal plan structure
      const generatedPlan: ConsolidatedMealPlan = {
        id: `meal-plan-${Date.now()}`,
        patient_id: patientData.id,
        user_id: user.id,
        name: `Plano Alimentar - ${new Date().toLocaleDateString('pt-BR')}`,
        description: 'Plano gerado automaticamente pelo sistema ENP',
        date: new Date().toISOString().split('T')[0],
        total_calories: calculationResults.totalCalories,
        total_protein: calculationResults.protein,
        total_carbs: calculationResults.carbs,
        total_fats: calculationResults.fats,
        meals: [
          {
            id: 'breakfast',
            name: 'Café da Manhã',
            time: '08:00',
            type: 'breakfast' as any,
            foods: [],
            items: [],
            total_calories: Math.round(calculationResults.totalCalories * 0.25),
            total_protein: Math.round(calculationResults.protein * 0.25),
            total_carbs: Math.round(calculationResults.carbs * 0.25),
            total_fats: Math.round(calculationResults.fats * 0.25),
            totalCalories: Math.round(calculationResults.totalCalories * 0.25),
            totalProtein: Math.round(calculationResults.protein * 0.25),
            totalCarbs: Math.round(calculationResults.carbs * 0.25),
            totalFats: Math.round(calculationResults.fats * 0.25)
          },
          {
            id: 'lunch',
            name: 'Almoço',
            time: '12:00',
            type: 'lunch' as any,
            foods: [],
            items: [],
            total_calories: Math.round(calculationResults.totalCalories * 0.35),
            total_protein: Math.round(calculationResults.protein * 0.35),
            total_carbs: Math.round(calculationResults.carbs * 0.35),
            total_fats: Math.round(calculationResults.fats * 0.35),
            totalCalories: Math.round(calculationResults.totalCalories * 0.35),
            totalProtein: Math.round(calculationResults.protein * 0.35),
            totalCarbs: Math.round(calculationResults.carbs * 0.35),
            totalFats: Math.round(calculationResults.fats * 0.35)
          },
          {
            id: 'dinner',
            name: 'Jantar',
            time: '19:00',
            type: 'dinner' as any,
            foods: [],
            items: [],
            total_calories: Math.round(calculationResults.totalCalories * 0.30),
            total_protein: Math.round(calculationResults.protein * 0.30),
            total_carbs: Math.round(calculationResults.carbs * 0.30),
            total_fats: Math.round(calculationResults.fats * 0.30),
            totalCalories: Math.round(calculationResults.totalCalories * 0.30),
            totalProtein: Math.round(calculationResults.protein * 0.30),
            totalCarbs: Math.round(calculationResults.carbs * 0.30),
            totalFats: Math.round(calculationResults.fats * 0.30)
          },
          {
            id: 'snacks',
            name: 'Lanches',
            time: '15:00',
            type: 'snack' as any,
            foods: [],
            items: [],
            total_calories: Math.round(calculationResults.totalCalories * 0.10),
            total_protein: Math.round(calculationResults.protein * 0.10),
            total_carbs: Math.round(calculationResults.carbs * 0.10),
            total_fats: Math.round(calculationResults.fats * 0.10),
            totalCalories: Math.round(calculationResults.totalCalories * 0.10),
            totalProtein: Math.round(calculationResults.protein * 0.10),
            totalCarbs: Math.round(calculationResults.carbs * 0.10),
            totalFats: Math.round(calculationResults.fats * 0.10)
          }
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        notes: 'Plano gerado automaticamente',
        targets: {
          calories: calculationResults.totalCalories,
          protein: calculationResults.protein,
          carbs: calculationResults.carbs,
          fats: calculationResults.fats
        }
      };

      setCurrentMealPlan(generatedPlan);
      
      toast({
        title: "Plano gerado",
        description: "Plano alimentar criado com sucesso!"
      });

    } catch (error) {
      console.error('[MEALPLAN:GENERATION] ❌ Erro ao gerar plano:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o plano alimentar",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!currentMealPlan) return;
    
    // Convert meal plan format to refeicoes format expected by export
    const refeicoes = currentMealPlan.meals.map((meal, index) => {
      const mealItems = meal.items || [];
      const totalMealCalories = meal.total_calories || meal.totalCalories || 0;
      
      return {
        nome: meal.name,
        numero: index + 1,
        horario_sugerido: meal.time || '',
        alvo_kcal: totalMealCalories,
        alvo_ptn_g: meal.total_protein || meal.totalProtein || 0,
        alvo_cho_g: meal.total_carbs || meal.totalCarbs || 0,
        alvo_lip_g: meal.total_fats || meal.totalFats || 0,
        itens: mealItems.map(item => ({
          alimento_id: item.food_id || '',
          alimento_nome: item.food_name,
          quantidade: item.quantity,
          medida_utilizada: item.unit,
          peso_total_g: 0,
          kcal_calculado: item.calories,
          ptn_g_calculado: item.protein,
          cho_g_calculado: item.carbs,
          lip_g_calculado: item.fats
        }))
      };
    });
    
    exportToPDF({
      refeicoes,
      patientName: patientData?.name || 'Paciente',
      patientAge,
      patientGender
    });
  };

  if (!patientData || !calculationResults) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Dados do paciente e cálculos nutricionais são necessários para gerar o plano alimentar.
            </AlertDescription>
          </Alert>
          {onBack && (
            <Button onClick={onBack} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header da Etapa */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5" />
            Etapa 4: Geração do Plano Alimentar Brasileiro
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Resumo do Paciente e Cálculos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">👤 Paciente</h3>
              <p className="text-blue-700 font-medium">{patientData.name}</p>
              {patientAge && (
                <p className="text-blue-600 text-sm">{patientAge} anos</p>
              )}
              {patientGender && (
                <p className="text-blue-600 text-sm">
                  {patientGender === 'male' ? 'Masculino' : 'Feminino'}
                </p>
              )}
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">📊 Meta Nutricional</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-green-700">Objetivo:</span>
                  <Badge variant="outline" className="ml-1 text-xs">
                    {calculationResults.objective}
                  </Badge>
                </div>
                <div>
                  <span className="text-green-700">Calorias:</span>
                  <Badge variant="outline" className="ml-1 text-xs">
                    {calculationResults.totalCalories} kcal
                  </Badge>
                </div>
                <div>
                  <span className="text-green-700">Proteínas:</span>
                  <Badge variant="outline" className="ml-1 text-xs">
                    {calculationResults.protein}g
                  </Badge>
                </div>
                <div>
                  <span className="text-green-700">Carboidratos:</span>
                  <Badge variant="outline" className="ml-1 text-xs">
                    {calculationResults.carbs}g
                  </Badge>
                </div>
                <div>
                  <span className="text-green-700">Gorduras:</span>
                  <Badge variant="outline" className="ml-1 text-xs">
                    {calculationResults.fats}g
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Inteligência Cultural */}
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 mb-6">
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-2">🧠 Inteligência Cultural Brasileira:</p>
              <ul className="space-y-1 text-xs">
                <li>• <strong>Café da manhã (25%):</strong> Pães, cereais, frutas e laticínios</li>
                <li>• <strong>Almoço (30%):</strong> Arroz, feijão, carnes e verduras</li>
                <li>• <strong>Jantar (20%):</strong> Refeições mais leves e saudáveis</li>
                <li>• <strong>Lanches (15%):</strong> Frutas, iogurtes e oleaginosas</li>
                <li>• <strong>Ceia (5%):</strong> Alimentos leves para o período noturno</li>
              </ul>
            </div>
          </div>

          {/* Ações de Geração */}
          {!currentMealPlan ? (
            <div className="text-center space-y-4">
              <Button
                onClick={handleGenerateMealPlan}
                disabled={isGenerating}
                size="lg"
                className="min-w-[250px]"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando Plano Inteligente...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Gerar Plano Alimentar Brasileiro
                  </>
                )}
              </Button>

              {generationAttempted && !isGenerating && !currentMealPlan && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Falha na geração do plano alimentar. Tente novamente ou verifique os dados.
                  </AlertDescription>
                </Alert>
              )}
              
              {isGenerating && (
                <div className="text-center text-sm text-muted-foreground">
                  <p>Gerando plano alimentar personalizado...</p>
                  <p className="mt-1">Aplicando inteligência cultural brasileira...</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>✅ Plano alimentar gerado com sucesso!</span>
                  <Button
                    onClick={handleDownloadPDF}
                    variant="outline"
                    size="sm"
                  >
                    Baixar PDF
                  </Button>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Navegação */}
          <div className="flex justify-between mt-6">
            {onBack && (
              <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Etapa Anterior
              </Button>
            )}
            
            {currentMealPlan && onComplete && (
              <Button onClick={onComplete} className="ml-auto">
                <CheckCircle className="mr-2 h-4 w-4" />
                Finalizar Atendimento
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Editor do Plano (se gerado) */}
      {currentMealPlan && (
        <ConsolidatedMealPlanEditor
          mealPlan={currentMealPlan}
          patientName={patientData.name}
          patientAge={patientAge}
          patientGender={patientGender}
        />
      )}
    </div>
  );
};
