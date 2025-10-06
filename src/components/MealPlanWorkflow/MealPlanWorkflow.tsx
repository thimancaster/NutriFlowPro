
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { useMealPlanWorkflow } from '@/contexts/MealPlanWorkflowContext';
import { useConsolidatedMealPlan } from '@/hooks/useConsolidatedMealPlan';
import { usePatient } from '@/contexts/patient/PatientContext';
import { useAuth } from '@/contexts/auth/AuthContext';
import MealPlanGenerationForm from './MealPlanGenerationForm';
import MealPlanDisplay from './MealPlanDisplay';
import ConsolidatedMealPlanEditor from '@/components/meal-plan/ConsolidatedMealPlanEditor';

const MealPlanWorkflow: React.FC = () => {
  const {
    currentStep,
    setCurrentStep,
    calculationData,
    error,
    clearError,
    resetWorkflow
  } = useMealPlanWorkflow();

  const {
    generateMealPlan,
    isGenerating,
    currentMealPlan,
    downloadPDF,
    printPDF,
    clearState
  } = useConsolidatedMealPlan();

  const { activePatient } = usePatient();
  const { user } = useAuth();
  const [validationMessage, setValidationMessage] = useState<string>('');

  // Validação de pré-condições
  const validateCanGenerate = (): { canGenerate: boolean; message: string } => {
    console.log('[MEALPLAN:GENERATE] Validando pré-condições:', {
      hasUser: !!user?.id,
      hasPatient: !!activePatient?.id,
      hasCalculationData: !!calculationData,
      calculationData
    });

    if (!user?.id) {
      return { canGenerate: false, message: 'Usuário não autenticado' };
    }

    if (!activePatient?.id) {
      return { canGenerate: false, message: 'Selecione um paciente primeiro' };
    }

    if (!calculationData) {
      return { canGenerate: false, message: 'Dados de cálculo nutricional não encontrados' };
    }

    if (!calculationData.totalCalories || calculationData.totalCalories < 800) {
      return { canGenerate: false, message: 'Calorias inválidas (mínimo 800 kcal)' };
    }

    if (!calculationData.protein || calculationData.protein < 10) {
      return { canGenerate: false, message: 'Proteínas inválidas (mínimo 10g)' };
    }

    if (!calculationData.carbs || calculationData.carbs < 50) {
      return { canGenerate: false, message: 'Carboidratos inválidos (mínimo 50g)' };
    }

    if (!calculationData.fats || calculationData.fats < 10) {
      return { canGenerate: false, message: 'Gorduras inválidas (mínimo 10g)' };
    }

    return { canGenerate: true, message: '' };
  };

  const { canGenerate, message } = validateCanGenerate();

  useEffect(() => {
    setValidationMessage(message);
  }, [message]);

  const handleGenerateMealPlan = async () => {
    console.log('[MEALPLAN:GENERATE] Clique no botão "Gerar Plano"', {
      patientId: activePatient?.id,
      patientName: activePatient?.name,
      calculationData,
      canGenerate
    });

    if (!canGenerate) {
      console.log('[MEALPLAN:GENERATE] Geração bloqueada por validação:', message);
      return;
    }

    if (!calculationData || !activePatient) {
      console.error('[MEALPLAN:GENERATE] Dados insuficientes');
      return;
    }

    clearError();

    try {
      console.log('[MEALPLAN:GENERATE] Iniciando geração com useConsolidatedMealPlan.generateMealPlan');
      
      const result = await generateMealPlan(
        calculationData.totalCalories,
        calculationData.protein,
        calculationData.carbs,
        calculationData.fats,
        activePatient.id
      );

      if (result) {
        console.log('[MEALPLAN:GENERATE] ✅ Plano gerado com sucesso:', result.id);
        setCurrentStep('display');
      } else {
        console.error('[MEALPLAN:GENERATE] ❌ Falha na geração - resultado null');
      }
    } catch (error: any) {
      console.error('[MEALPLAN:GENERATE] ❌ Erro na geração:', error);
    }
  };

  const handleEditMealPlan = () => {
    console.log('[MEALPLAN:GENERATE] Navegando para edição do plano');
    setCurrentStep('editing');
  };

  const handleEditGenerationParams = () => {
    console.log('[MEALPLAN:GENERATE] Voltando para configuração de parâmetros');
    setCurrentStep('generation');
  };

  const handleReset = () => {
    console.log('[MEALPLAN:GENERATE] Reset do workflow');
    clearState();
    resetWorkflow();
  };

  const handleDownloadPDF = async () => {
    if (!currentMealPlan || !activePatient) return;
    
    console.log('[MEALPLAN:GENERATE] Gerando PDF para download');
    await downloadPDF(
      currentMealPlan,
      activePatient.name,
      activePatient.age,
      activePatient.gender as 'male' | 'female'
    );
  };

  const handlePrintPDF = async () => {
    if (!currentMealPlan || !activePatient) return;
    
    console.log('[MEALPLAN:GENERATE] Gerando PDF para impressão');
    await printPDF(
      currentMealPlan,
      activePatient.name,
      activePatient.age,
      activePatient.gender as 'male' | 'female'
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workflow do Plano Alimentar</CardTitle>
        <CardDescription>
          Gerar, editar e visualizar o plano alimentar do paciente.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Erro Global */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Etapa: Geração */}
        {currentStep === 'generation' && (
          <MealPlanGenerationForm 
            onGenerate={handleGenerateMealPlan}
            isGenerating={isGenerating}
            canGenerate={canGenerate}
            validationMessage={validationMessage}
            patientName={activePatient?.name}
            calculationData={calculationData}
          />
        )}

        {/* Etapa: Exibição do Plano */}
        {currentStep === 'display' && currentMealPlan && (
          <MealPlanDisplay
            mealPlan={currentMealPlan}
            patientName={activePatient?.name}
            onEdit={handleEditMealPlan}
            onEditParams={handleEditGenerationParams}
            onDownloadPDF={handleDownloadPDF}
            onPrintPDF={handlePrintPDF}
            onRegenerate={handleGenerateMealPlan}
          />
        )}

        {/* Etapa: Edição do Plano */}
        {currentStep === 'editing' && currentMealPlan && (
          <ConsolidatedMealPlanEditor
            mealPlan={currentMealPlan}
            patientName={activePatient?.name}
            patientAge={activePatient?.age}
            patientGender={activePatient?.gender as 'male' | 'female'}
          />
        )}

        {/* Navegação */}
        <div className="flex justify-between pt-4">
          {currentStep !== 'generation' && (
            <Button variant="outline" onClick={handleReset}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Início
            </Button>
          )}
          
          {currentStep === 'editing' && (
            <Button onClick={() => setCurrentStep('display')} className="ml-auto">
              Ver Resumo
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MealPlanWorkflow;
