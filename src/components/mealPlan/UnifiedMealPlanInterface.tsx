/**
 * UNIFIED MEAL PLAN INTERFACE
 * Interface unificada para geração automática + edição de planos alimentares
 * 
 * FASE 2 - SPRINT U1: Refatorado para usar UnifiedNutritionContext
 */

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import AutoGenerationPanel from './AutoGenerationPanel';
import UnifiedMealPlanEditor from './UnifiedMealPlanEditor';
import MealPlanPreview from './MealPlanPreview';
import MealPlanHistory from './MealPlanHistory';
import { ConsolidatedMealPlan } from '@/types/mealPlanTypes';
import { CalculationResult } from '@/utils/nutrition/official/officialCalculations';
import { Wand2, Edit, Eye, History } from 'lucide-react';
import { useUnifiedNutrition } from '@/contexts/UnifiedNutritionContext';

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
  const { currentPlan, initializeSession } = useUnifiedNutrition();
  const [activeTab, setActiveTab] = useState<'generate' | 'edit' | 'preview' | 'history'>('generate');

  // Inicializar sessão quando o componente montar
  useEffect(() => {
    initializeSession(
      { id: patientId, name: patientName },
      calculationResults
    );
  }, [patientId, patientName, calculationResults, initializeSession]);

  const handlePlanGenerated = () => {
    setActiveTab('edit');
  };

  const handleSave = async () => {
    if (currentPlan && onSave) {
      onSave(currentPlan);
    }
  };

  const targets = {
    calories: calculationResults.vet || 2000,
    protein: calculationResults.macros.protein.grams || 100,
    carbs: calculationResults.macros.carbs.grams || 250,
    fats: calculationResults.macros.fat.grams || 60,
  };

  return (
    <Card className="w-full">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full grid-cols-4">
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
          <TabsTrigger value="history" disabled={!currentPlan?.id} className="gap-2">
            <History className="h-4 w-4" />
            Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="p-6">
          <AutoGenerationPanel
            onPlanGenerated={handlePlanGenerated}
          />
        </TabsContent>

        <TabsContent value="edit" className="p-6">
          {currentPlan ? (
            <UnifiedMealPlanEditor
              onSave={handleSave}
              onCancel={onCancel}
              targets={targets}
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
              onEdit={() => setActiveTab('edit')}
              onSave={handleSave}
            />
          ) : (
            <div className="text-center text-muted-foreground py-12">
              Nenhum plano para visualizar
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="p-6">
          {currentPlan?.id ? (
            <MealPlanHistory onVersionRestore={() => setActiveTab('edit')} />
          ) : (
            <div className="text-center text-muted-foreground py-12">
              <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Salve o plano para ver o histórico de versões</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default UnifiedMealPlanInterface;
