
import React, { useState } from 'react';
import { MealPlanWorkflowProvider } from '@/contexts/MealPlanWorkflowContext';
import MealPlanWorkflow from '@/components/MealPlanWorkflow/MealPlanWorkflow';
import WorkflowGuard from '@/components/MealPlanWorkflow/WorkflowGuard';
import WorkflowDiagnostic from '@/components/MealPlanWorkflow/WorkflowDiagnostic';
import { usePatient } from '@/contexts/patient/PatientContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const MealPlanWorkflowPage: React.FC = () => {
  const { activePatient } = usePatient();
  const navigate = useNavigate();
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  
  // Check if we're coming from an error (URL parameter)
  const urlParams = new URLSearchParams(window.location.search);
  const hasError = urlParams.get('error') === 'calculation';
  
  return (
    <div className="container mx-auto px-4 py-8">
      <MealPlanWorkflowProvider>
        {/* Error Alert */}
        {hasError && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Erro no cálculo detectado:</strong> O sistema foi atualizado para corrigir problemas de banco de dados.
              <Button 
                variant="link" 
                className="ml-2 p-0 h-auto text-red-700 underline"
                onClick={() => setShowDiagnostic(true)}
              >
                Ver diagnóstico completo
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        <Tabs value={showDiagnostic ? "diagnostic" : "workflow"} onValueChange={(v) => setShowDiagnostic(v === "diagnostic")}>
          <TabsList className="mb-6">
            <TabsTrigger value="workflow">Workflow do Plano Alimentar</TabsTrigger>
            <TabsTrigger value="diagnostic">
              <Info className="h-4 w-4 mr-2" />
              Diagnóstico do Sistema
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="workflow">
            <WorkflowGuard 
              step="calculation"
              patient={activePatient}
              onNavigateToPatients={() => navigate('/patients')}
              onNavigateToCalculator={() => navigate('/calculator')}
            >
              <MealPlanWorkflow />
            </WorkflowGuard>
          </TabsContent>
          
          <TabsContent value="diagnostic">
            <WorkflowDiagnostic />
          </TabsContent>
        </Tabs>
      </MealPlanWorkflowProvider>
    </div>
  );
};

export default MealPlanWorkflowPage;
