
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Share2 } from 'lucide-react';
import { useUnifiedCalculator } from '@/hooks/useUnifiedCalculator';
import { usePatient } from '@/contexts/patient/PatientContext';
import { useMealPlanWorkflow } from '@/contexts/MealPlanWorkflowContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const UnifiedSummaryStep: React.FC = () => {
  const { calculatorData } = useUnifiedCalculator();
  const { activePatient } = usePatient();
  const { currentMealPlan } = useMealPlanWorkflow();

  const handleExportPDF = () => {
    console.log('Exportar PDF da consulta completa');
    // Implementar exportação PDF
  };

  const handleShare = () => {
    console.log('Compartilhar consulta');
    // Implementar compartilhamento
  };

  if (!calculatorData || !activePatient) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Dados incompletos para exibir resumo</p>
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
            Resumo da Consulta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Informações do Paciente */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Informações do Paciente</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong>Nome:</strong> {activePatient.name}
              </div>
              <div>
                <strong>Idade:</strong> {calculatorData.age} anos
              </div>
              <div>
                <strong>Sexo:</strong> {calculatorData.gender === 'male' ? 'Masculino' : 'Feminino'}
              </div>
              <div>
                <strong>Objetivo:</strong> {calculatorData.objective}
              </div>
            </div>
          </div>

          {/* Resultados Nutricionais */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Resultados Nutricionais</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{calculatorData.bmr}</div>
                <div className="text-sm text-muted-foreground">TMB (kcal)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{calculatorData.tdee}</div>
                <div className="text-sm text-muted-foreground">VET (kcal)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{calculatorData.protein}g</div>
                <div className="text-sm text-muted-foreground">Proteína</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{calculatorData.carbs}g</div>
                <div className="text-sm text-muted-foreground">Carboidratos</div>
              </div>
            </div>
          </div>

          {/* Status do Plano Alimentar */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Plano Alimentar</h3>
            {currentMealPlan ? (
              <div className="flex items-center gap-2">
                <Badge variant="default">Plano Gerado</Badge>
                <span className="text-sm text-muted-foreground">
                  {format(new Date(currentMealPlan.date), 'dd/MM/yyyy', { locale: ptBR })}
                </span>
              </div>
            ) : (
              <Badge variant="outline">Não gerado</Badge>
            )}
          </div>

          {/* Ações */}
          <div className="flex gap-2 justify-end">
            <Button 
              onClick={handleShare}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              Compartilhar
            </Button>
            <Button 
              onClick={handleExportPDF}
              size="sm"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Exportar PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnifiedSummaryStep;
