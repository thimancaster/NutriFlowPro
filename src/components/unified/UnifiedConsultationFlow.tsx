
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, Utensils, FileText, User } from 'lucide-react';
import { usePatient } from '@/contexts/patient/PatientContext';
import { useUnifiedCalculator } from '@/hooks/useUnifiedCalculator';
import { useMealPlanWorkflow } from '@/contexts/MealPlanWorkflowContext';
import { useNavigate } from 'react-router-dom';

// Componentes que serão criados
import UnifiedCalculatorStep from './UnifiedCalculatorStep';
import UnifiedMealPlanStep from './UnifiedMealPlanStep';
import UnifiedSummaryStep from './UnifiedSummaryStep';

const UnifiedConsultationFlow: React.FC = () => {
  const [activeTab, setActiveTab] = useState('calculator');
  const { activePatient } = usePatient();
  const { calculatorData } = useUnifiedCalculator();
  const { currentMealPlan } = useMealPlanWorkflow();
  const navigate = useNavigate();

  if (!activePatient) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Selecione um Paciente</h3>
          <p className="text-muted-foreground mb-4">
            Escolha um paciente para iniciar a consulta
          </p>
          <Button onClick={() => navigate('/patients')}>
            Ir para Pacientes
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
            <FileText className="h-5 w-5" />
            Consulta Unificada - {activePatient.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="calculator" className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Cálculo Nutricional
              </TabsTrigger>
              <TabsTrigger 
                value="meal-plan" 
                className="flex items-center gap-2"
                disabled={!calculatorData}
              >
                <Utensils className="h-4 w-4" />
                Plano Alimentar
              </TabsTrigger>
              <TabsTrigger 
                value="summary" 
                className="flex items-center gap-2"
                disabled={!calculatorData}
              >
                <FileText className="h-4 w-4" />
                Resumo
              </TabsTrigger>
            </TabsList>

            <TabsContent value="calculator" className="mt-6">
              <UnifiedCalculatorStep onComplete={() => setActiveTab('meal-plan')} />
            </TabsContent>

            <TabsContent value="meal-plan" className="mt-6">
              <UnifiedMealPlanStep onComplete={() => setActiveTab('summary')} />
            </TabsContent>

            <TabsContent value="summary" className="mt-6">
              <UnifiedSummaryStep />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnifiedConsultationFlow;
