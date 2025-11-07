/**
 * UNIFIED MEAL PLAN INTERFACE
 * Interface unificada para geração automática + edição de planos alimentares
 */

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import AutoGenerationPanel from './AutoGenerationPanel';
import FluidMealEditor from './FluidMealEditor';
import MealPlanPreview from './MealPlanPreview';
import { ConsolidatedMealPlan } from '@/types/mealPlanTypes';
import { CalculationResult } from '@/utils/nutrition/official/officialCalculations';
import { Wand2, Edit, Eye } from 'lucide-react';

interface UnifiedMealPlanInterfaceProps {
  patientId: string;
  patientName: string;
  calculationResults: CalculationResult;
  onSave?: (plan: ConsolidatedMealPlan) => void;
  onCancel?: () => void;
}

const UnifiedMealPlanInterface: React.FC<UnifiedMealPlanInterfaceProps> = ({
  patientId,
  patientName,
  calculationResults,
  onSave,
  onCancel
}) => {
  const [currentPlan, setCurrentPlan] = useState<ConsolidatedMealPlan | null>(null);
  const [activeTab, setActiveTab] = useState<'generate' | 'edit' | 'preview'>('generate');

  const handlePlanGenerated = (plan: ConsolidatedMealPlan) => {
    setCurrentPlan(plan);
    setActiveTab('edit');
  };

  const handlePlanUpdated = (updatedPlan: ConsolidatedMealPlan) => {
    setCurrentPlan(updatedPlan);
  };

  const handleSave = () => {
    if (currentPlan && onSave) {
      onSave(currentPlan);
    }
  };

  return (
    <Card className="w-full">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generate" className="gap-2">
            <Wand2 className="h-4 w-4" />
            Gerar Automático
          </TabsTrigger>
          <TabsTrigger value="edit" disabled={!currentPlan} className="gap-2">
            <Edit className="h-4 w-4" />
            Editar
          </TabsTrigger>
          <TabsTrigger value="preview" disabled={!currentPlan} className="gap-2">
            <Eye className="h-4 w-4" />
            Visualizar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="p-6">
          <AutoGenerationPanel
            patientId={patientId}
            patientName={patientName}
            calculationResults={calculationResults}
            onPlanGenerated={handlePlanGenerated}
          />
        </TabsContent>

        <TabsContent value="edit" className="p-6">
          {currentPlan ? (
            <FluidMealEditor
              mealPlan={currentPlan}
              onUpdate={handlePlanUpdated}
              onSave={handleSave}
              onCancel={onCancel}
            />
          ) : (
            <div className="text-center text-muted-foreground py-12">
              Gere um plano primeiro para poder editá-lo
            </div>
          )}
        </TabsContent>

        <TabsContent value="preview" className="p-6">
          {currentPlan ? (
            <MealPlanPreview
              mealPlan={currentPlan}
              patientName={patientName}
              onEdit={() => setActiveTab('edit')}
              onSave={handleSave}
            />
          ) : (
            <div className="text-center text-muted-foreground py-12">
              Nenhum plano para visualizar
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default UnifiedMealPlanInterface;
