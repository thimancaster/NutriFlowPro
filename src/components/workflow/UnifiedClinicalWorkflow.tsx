import React, { useState, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from 'react-router-dom';
import { ConsultationData } from '@/types';
import ClinicalForm from '../clinical/ClinicalForm';
import MealPlanGenerationStep from '../MealPlanWorkflow/MealPlanGenerationStep';
import WorkflowHeader from '../clinical/WorkflowHeader';

interface UnifiedClinicalWorkflowProps {
  patientId: string;
  initialConsultationData?: ConsultationData;
  onConsultationComplete?: (data: ConsultationData) => void;
  onMealPlanComplete?: (mealPlanId: string) => void;
}

const UnifiedClinicalWorkflow: React.FC<UnifiedClinicalWorkflowProps> = ({
  patientId,
  initialConsultationData,
  onConsultationComplete,
  onMealPlanComplete
}) => {
  const [consultationData, setConsultationData] = useState<ConsultationData>(initialConsultationData || {
    patient_id: patientId,
    totalCalories: 0,
    protein: 0,
    carbs: 0,
    fats: 0
  });
  const [activeTab, setActiveTab] = useState('clinical');
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const handleConsultationUpdate = (data: Partial<ConsultationData>) => {
    setConsultationData(prev => ({ ...prev, ...data }));
  };

  const handleConsultationComplete = useCallback((data: ConsultationData) => {
    if (onConsultationComplete) {
      onConsultationComplete(data);
    }
  }, [onConsultationComplete]);

  const handleMealPlanGenerated = useCallback((generatedMealPlan: ConsolidatedMealPlan) => {
    // Convert the ConsolidatedMealPlan to a string ID for the callback
    if (onMealPlanComplete) {
      onMealPlanComplete(generatedMealPlan.id);
    }
    // Optionally, you can also navigate the user or perform other actions
    navigate(`/meal-plan/${generatedMealPlan.id}`);
  }, [onMealPlanComplete, navigate]);

  return (
    <div className="container mx-auto py-8">
      <Button variant="ghost" onClick={() => navigate(`/patient/${id}`)} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
      </Button>

      <WorkflowHeader patientId={patientId} consultationData={consultationData} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="clinical">Avaliação Clínica</TabsTrigger>
          <TabsTrigger value="meal-plan">Plano Alimentar</TabsTrigger>
        </TabsList>
        <TabsContent value="clinical" className="outline-none">
          <ClinicalForm
            patientId={patientId}
            initialConsultationData={consultationData}
            onConsultationUpdate={handleConsultationUpdate}
            onConsultationComplete={handleConsultationComplete}
          />
        </TabsContent>
        <TabsContent value="meal-plan" className="outline-none">
          <MealPlanGenerationStep
            patientId={patientId}
            consultationData={consultationData}
            onMealPlanGenerated={handleMealPlanGenerated}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UnifiedClinicalWorkflow;
