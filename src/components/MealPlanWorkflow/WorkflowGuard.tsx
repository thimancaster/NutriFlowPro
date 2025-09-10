/**
 * 🛡️ WORKFLOW GUARD COMPONENT
 * 
 * Prevents invalid workflow transitions and provides clear user feedback
 * when requirements are not met in the NutriFlow Pro workflow.
 */

import React from 'react';
import { AlertCircle, User, Calculator, UtensilsCrossed } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { validatePatientForCalculation, validateCalculationForMealPlan } from '@/utils/calculationValidation';

interface WorkflowGuardProps {
  step: 'calculation' | 'meal-plan';
  patient?: any;
  calculation?: any;
  onNavigateToPatients?: () => void;
  onNavigateToCalculator?: () => void;
  children: React.ReactNode;
}

export default function WorkflowGuard({ 
  step, 
  patient, 
  calculation, 
  onNavigateToPatients,
  onNavigateToCalculator,
  children 
}: WorkflowGuardProps) {
  
  if (step === 'calculation') {
    const validation = validatePatientForCalculation(patient);
    
    if (!validation.canCalculate) {
      return (
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <User className="w-6 h-6 text-orange-600" />
            </div>
            <CardTitle className="text-xl">Seleção de Paciente Necessária</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{validation.message}</AlertDescription>
            </Alert>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {onNavigateToPatients && (
                <Button onClick={onNavigateToPatients} className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Selecionar Paciente
                </Button>
              )}
            </div>
            
            <div className="text-center text-sm text-muted-foreground">
              <p>Fluxo requerido: <strong>Paciente → Cálculo → Plano Alimentar</strong></p>
            </div>
          </CardContent>
        </Card>
      );
    }
  }
  
  if (step === 'meal-plan') {
    const validation = validateCalculationForMealPlan(calculation);
    
    if (!validation.canGenerateMealPlan) {
      return (
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Calculator className="w-6 h-6 text-blue-600" />
            </div>
            <CardTitle className="text-xl">Cálculo Nutricional Necessário</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{validation.message}</AlertDescription>
            </Alert>
            
            {validation.calculationStatus && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Status atual do cálculo: 
                  <span className="ml-2 px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                    {validation.calculationStatus === 'em_andamento' ? 'Em Andamento' : 
                     validation.calculationStatus === 'concluida' ? 'Concluído' : 'Cancelado'}
                  </span>
                </p>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {onNavigateToCalculator && (
                <Button onClick={onNavigateToCalculator} className="flex items-center gap-2">
                  <Calculator className="w-4 h-4" />
                  Ir para Calculadora
                </Button>
              )}
            </div>
            
            <div className="text-center text-sm text-muted-foreground">
              <p>Fluxo requerido: <strong>Paciente → Cálculo → Plano Alimentar</strong></p>
            </div>
          </CardContent>
        </Card>
      );
    }
  }
  
  // If all validations pass, render children
  return <>{children}</>;
}

/**
 * Hook to use workflow validation in components
 */
export function useWorkflowValidation(patient?: any, calculation?: any) {
  const patientValidation = validatePatientForCalculation(patient);
  const calculationValidation = validateCalculationForMealPlan(calculation);
  
  return {
    patient: patientValidation,
    calculation: calculationValidation,
    canCalculate: patientValidation.canCalculate,
    canGenerateMealPlan: calculationValidation.canGenerateMealPlan,
  };
}