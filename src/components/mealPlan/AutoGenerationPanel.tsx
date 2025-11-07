/**
 * AUTO GENERATION PANEL
 * Painel para geração automática de planos alimentares
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Wand2, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MealPlanOrchestrator } from '@/services/mealPlan/MealPlanOrchestrator';
import { ConsolidatedMealPlan } from '@/types/mealPlanTypes';
import { CalculationResult } from '@/utils/nutrition/official/officialCalculations';
import { useAuth } from '@/contexts/auth/AuthContext';
import PatientPreferencesPanel from './PatientPreferencesPanel';
import SmartTemplatesPanel from './SmartTemplatesPanel';

interface AutoGenerationPanelProps {
  patientId: string;
  patientName: string;
  calculationResults: CalculationResult;
  onPlanGenerated: (plan: ConsolidatedMealPlan) => void;
}

const AutoGenerationPanel: React.FC<AutoGenerationPanelProps> = ({
  patientId,
  patientName,
  calculationResults,
  onPlanGenerated
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [generatedPlan, setGeneratedPlan] = useState<ConsolidatedMealPlan | null>(null);

  const steps = [
    { label: 'Analisando necessidades nutricionais...', duration: 500 },
    { label: 'Selecionando alimentos culturalmente apropriados...', duration: 1500 },
    { label: 'Calculando porções otimizadas...', duration: 1000 },
    { label: 'Distribuindo por refeições...', duration: 1000 },
    { label: 'Finalizando plano alimentar...', duration: 500 }
  ];

  const handleGenerate = async () => {
    if (!user?.id) {
      toast({
        title: 'Erro',
        description: 'Usuário não autenticado',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setGeneratedPlan(null);

    try {
      // Simular progresso com as etapas
      let currentProgress = 0;
      for (const step of steps) {
        setCurrentStep(step.label);
        await new Promise(resolve => setTimeout(resolve, step.duration));
        currentProgress += 100 / steps.length;
        setProgress(Math.min(currentProgress, 95));
      }

      // Gerar plano
      const plan = await MealPlanOrchestrator.generateAutomaticPlan({
        userId: user.id,
        patientId,
        calculationResults,
        patientData: {
          name: patientName
        }
      });

      setProgress(100);
      setCurrentStep('Plano gerado com sucesso!');
      setGeneratedPlan(plan);

      toast({
        title: 'Sucesso!',
        description: 'Plano alimentar gerado automaticamente com sucesso!'
      });

      // Chamar callback após um delay
      setTimeout(() => {
        onPlanGenerated(plan);
      }, 1000);
      
    } catch (error: any) {
      console.error('Erro ao gerar plano:', error);
      toast({
        title: 'Erro ao gerar plano',
        description: error.message || 'Erro desconhecido',
        variant: 'destructive'
      });
      setIsGenerating(false);
    }
  };

  const targets = {
    calories: calculationResults.vet || 2000,
    protein: calculationResults.macros.protein.grams || 100,
    carbs: calculationResults.macros.carbs.grams || 250,
    fats: calculationResults.macros.fat.grams || 60,
  };

  return (
    <div className="space-y-6">
      {/* Preferências do Paciente */}
      <PatientPreferencesPanel
        patientId={patientId}
        onPreferencesLoaded={(prefs) => console.log('Preferências carregadas:', prefs)}
      />

      {/* Templates Inteligentes */}
      <SmartTemplatesPanel
        targets={targets}
        onSelectTemplate={(template) => {
          toast({
            title: "Template selecionado",
            description: `Gerando plano baseado em: ${template.name}`,
          });
          // TODO: Integrar com geração usando template
        }}
      />

      <Card>
        <CardHeader>
          <CardTitle>Geração Automática de Plano Alimentar</CardTitle>
          <CardDescription>
            O sistema irá gerar automaticamente um plano alimentar completo baseado nas metas nutricionais calculadas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Metas Nutricionais */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Calorias</p>
              <p className="text-2xl font-bold">{calculationResults.vet} kcal</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Proteína</p>
              <p className="text-2xl font-bold">{calculationResults.macros.protein.grams}g</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Carboidrato</p>
              <p className="text-2xl font-bold">{calculationResults.macros.carbs.grams}g</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Gordura</p>
              <p className="text-2xl font-bold">{calculationResults.macros.fat.grams}g</p>
            </div>
          </div>

          {/* Progresso */}
          {isGenerating && (
            <div className="space-y-4">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-center text-muted-foreground animate-pulse">
                {currentStep}
              </p>
            </div>
          )}

          {/* Sucesso */}
          {generatedPlan && !isGenerating && (
            <div className="flex items-center justify-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              <p className="font-medium">Plano gerado com sucesso!</p>
            </div>
          )}

          {/* Botão */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full"
            size="lg"
          >
            <Wand2 className="h-4 w-4 mr-2" />
            {isGenerating ? 'Gerando...' : 'Gerar Plano Automático'}
          </Button>
        </CardContent>
      </Card>

      {/* Informações */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base">Como funciona?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>✓ Distribuição automática de calorias por refeição</p>
          <p>✓ Seleção de alimentos culturalmente apropriados</p>
          <p>✓ Cálculo otimizado de porções</p>
          <p>✓ Balanceamento de macronutrientes</p>
          <p>✓ Pronto para editar e personalizar</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AutoGenerationPanel;
