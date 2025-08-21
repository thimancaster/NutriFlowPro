
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle, UserPlus, LayoutDashboard, Utensils } from "lucide-react";
import { PatientForm } from "@/components/patient/PatientForm";
import { usePatientForm } from "@/hooks/usePatientForm";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';
import { useMealPlanWorkflow } from '@/contexts/MealPlanWorkflowContext';
import MealPlanGenerator from '@/components/meal-plan/MealPlanGenerator';
import MealPlanEditingStep from '@/components/MealPlanWorkflow/MealPlanEditingStep';
import { ConsolidatedMealPlan } from '@/types/mealPlan';
import { MealPlanService } from '@/services/mealPlanService';

const tabs = [
  { id: 'patient', label: 'Paciente', icon: UserPlus },
  { id: 'meal-plan', label: 'Plano Alimentar', icon: Utensils },
  { id: 'review', label: 'Revisão', icon: CheckCircle },
];

const initialMealPlan: ConsolidatedMealPlan = {
  id: '',
  user_id: '',
  patient_id: '',
  date: new Date().toISOString().split('T')[0],
  total_calories: 2000,
  total_protein: 150,
  total_carbs: 200,
  total_fats: 80,
  meals: [],
  notes: ''
};

export interface UnifiedClinicalWorkflowProps {
  onWorkflowComplete?: () => void;
}

const UnifiedClinicalWorkflow: React.FC<UnifiedClinicalWorkflowProps> = ({ onWorkflowComplete }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const [patientData, setPatientData] = useState<any>(null);
  const [mealPlan, setMealPlan] = useState<ConsolidatedMealPlan>(initialMealPlan);
  const { setCurrentStep, isSaving } = useMealPlanWorkflow();

  const { handleSubmit: handlePatientSubmit, isLoading: isPatientSaving, error: patientError } = usePatientForm({
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Paciente salvo com sucesso!",
      });
      setActiveTab('meal-plan');
    }
  });

  const handlePatientSave = async (data: any) => {
    try {
      await handlePatientSubmit(data);
      setPatientData(data);
    } catch (error: any) {
      console.error("Erro ao salvar paciente:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar paciente",
        variant: "destructive",
      });
    }
  };

  const handleMealPlanGenerated = (generatedMealPlan: ConsolidatedMealPlan) => {
    setMealPlan(generatedMealPlan);
    setActiveTab('review');
  };

  const handleSaveMealPlan = async (updates: Partial<ConsolidatedMealPlan>) => {
    try {
      setCurrentStep('editing');
      const result = await MealPlanService.updateMealPlan(mealPlan.id, updates);

      if (result.success && result.data) {
        setMealPlan(result.data);
        toast({
          title: "Sucesso",
          description: "Plano alimentar salvo com sucesso!",
        });
      } else {
        throw new Error(result.error || 'Erro ao salvar');
      }
    } catch (error: any) {
      console.error('Erro ao salvar plano:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar plano alimentar",
        variant: "destructive",
      });
    } finally {
      setCurrentStep('completed');
    }
  };

  const handleCompleteWorkflow = () => {
    toast({
      title: "Sucesso",
      description: "Workflow concluído com sucesso!",
    });
    navigate('/dashboard');
    if (onWorkflowComplete) {
      onWorkflowComplete();
    }
  };

  return (
    <div className="container mx-auto max-w-4xl p-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5" />
            Workflow Clínico Unificado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Patient Tab */}
            <TabsContent value="patient" className="space-y-4">
              <h2 className="text-xl font-semibold">Informações do Paciente</h2>
              <PatientForm onSubmit={handlePatientSave} isLoading={isPatientSaving} />
            </TabsContent>

            {/* Meal Plan Tab */}
            <TabsContent value="meal-plan" className="space-y-4">
              <h2 className="text-xl font-semibold">Gerar Plano Alimentar</h2>
              <MealPlanGenerator onMealPlanGenerated={handleMealPlanGenerated} />
            </TabsContent>

            {/* Review Tab */}
            <TabsContent value="review" className="space-y-4">
              <h2 className="text-xl font-semibold">Revisão do Plano Alimentar</h2>
              {mealPlan && (
                <MealPlanEditingStep
                  mealPlan={mealPlan}
                  onSave={handleSaveMealPlan}
                  onBack={() => setActiveTab('meal-plan')}
                />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => {
            const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
            if (currentIndex > 0) {
              setActiveTab(tabs[currentIndex - 1].id);
            }
          }}
          disabled={activeTab === tabs[0].id || isSaving}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        {activeTab === 'review' ? (
          <Button onClick={handleCompleteWorkflow} disabled={isSaving}>
            Concluir Workflow
            <CheckCircle className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={() => {
              const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
              if (currentIndex < tabs.length - 1) {
                setActiveTab(tabs[currentIndex + 1].id);
              }
            }}
            disabled={isSaving}
          >
            Próximo
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default UnifiedClinicalWorkflow;
