
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Utensils, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { usePatient } from '@/contexts/patient/PatientContext';
import { useUnifiedCalculator } from '@/hooks/useUnifiedCalculator';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';

const MealPlanStep: React.FC = () => {
  const { user } = useAuth();
  const { activePatient } = usePatient();
  const { calculatorData } = useUnifiedCalculator();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleGenerateMealPlan = () => {
    if (!activePatient || !calculatorData) {
      toast({
        title: 'Dados Incompletos',
        description: 'Complete o cálculo nutricional primeiro',
        variant: 'destructive'
      });
      return;
    }

    // Navegar para a página de consulta unificada
    navigate('/consultation');
  };

  const handleCreateManualPlan = () => {
    if (!activePatient) {
      toast({
        title: 'Erro',
        description: 'Selecione um paciente primeiro',
        variant: 'destructive'
      });
      return;
    }

    navigate('/meal-plan-generator');
  };

  if (!activePatient) {
    return (
      <Card>
        <CardContent className="p-6 text-center space-y-4">
          <p className="text-muted-foreground">Selecione um paciente para continuar</p>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Use o sistema de Consulta Unificada para um fluxo completo.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5 text-nutri-green" />
            Plano Alimentar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Migração para Sistema Unificado */}
          <Alert className="border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-700">
              <strong>Sistema Unificado:</strong> Use a nova página de Consulta para um fluxo completo 
              que inclui cálculo nutricional e geração de plano alimentar.
            </AlertDescription>
          </Alert>

          {/* Informações do Paciente */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Paciente: {activePatient.name}</h3>
            {calculatorData ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">VET:</span> {calculatorData.tdee} kcal/dia
                </div>
                <div>
                  <span className="font-medium">Proteínas:</span> {calculatorData.protein}g
                </div>
                <div>
                  <span className="font-medium">Carboidratos:</span> {calculatorData.carbs}g
                </div>
                <div>
                  <span className="font-medium">Gorduras:</span> {calculatorData.fats}g
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                Nenhum cálculo nutricional encontrado. Complete o cálculo primeiro.
              </p>
            )}
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleGenerateMealPlan}
              className="flex-1 bg-nutri-green hover:bg-nutri-green-dark"
            >
              <Utensils className="mr-2 h-4 w-4" />
              Ir para Consulta Unificada
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <Button 
              variant="outline" 
              onClick={handleCreateManualPlan}
              className="flex-1"
            >
              <Utensils className="mr-2 h-4 w-4" />
              Criar Plano Manual
            </Button>
          </div>

          {!calculatorData && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <p className="text-amber-800 dark:text-amber-200 text-sm">
                <strong>Recomendação:</strong> Use a página de Consulta Unificada para um fluxo completo 
                que inclui cálculo nutricional e geração de plano alimentar.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MealPlanStep;
