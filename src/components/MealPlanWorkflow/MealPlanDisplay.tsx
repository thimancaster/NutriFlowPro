
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, FileText, Printer, Edit, RefreshCw } from 'lucide-react';
import { ConsolidatedMealPlan } from '@/types/mealPlanTypes';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MealPlanDisplayProps {
  mealPlan: ConsolidatedMealPlan;
  patientName?: string;
  onEdit?: () => void;
  onEditParams?: () => void;
  onDownloadPDF?: () => void;
  onPrintPDF?: () => void;
  onRegenerate?: () => void;
}

const MealPlanDisplay: React.FC<MealPlanDisplayProps> = ({
  mealPlan,
  patientName = 'Paciente',
  onEdit,
  onEditParams,
  onDownloadPDF,
  onPrintPDF,
  onRegenerate
}) => {
  return (
    <div className="space-y-6">
      {/* Cabeçalho de Sucesso */}
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>✅ Plano alimentar brasileiro gerado com sucesso para <strong>{patientName}</strong>!</span>
        </AlertDescription>
      </Alert>

      {/* Resumo do Plano */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              🇧🇷 Plano Alimentar - {format(new Date(mealPlan.date || mealPlan.created_at), "dd/MM/yyyy", { locale: ptBR })}
            </CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline">{mealPlan.total_calories.toFixed(0)} kcal</Badge>
              <Badge variant="outline">P: {mealPlan.total_protein.toFixed(0)}g</Badge>
              <Badge variant="outline">C: {mealPlan.total_carbs.toFixed(0)}g</Badge>
              <Badge variant="outline">G: {mealPlan.total_fats.toFixed(0)}g</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Preview das Refeições */}
          <div className="space-y-3">
            <h4 className="font-medium">Refeições Criadas:</h4>
            <div className="grid gap-2">
              {mealPlan.meals.map((meal) => (
                <div key={meal.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium">{meal.name}</span>
                    <span className="text-sm text-muted-foreground ml-2">({meal.time})</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {(meal.items?.length || meal.foods?.length || 0)} {(meal.items?.length || meal.foods?.length || 0) === 1 ? 'item' : 'itens'}
                    </span>
                  </div>
                  <Badge variant="secondary">
                    {meal.totalCalories.toFixed(0)} kcal
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Ações */}
          <div className="flex flex-wrap gap-2 mt-6">
            {onDownloadPDF && (
              <Button onClick={onDownloadPDF} variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Baixar PDF
              </Button>
            )}
            
            {onPrintPDF && (
              <Button onClick={onPrintPDF} variant="outline">
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
            )}
            
            {onEdit && (
              <Button onClick={onEdit} variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Editar Plano
              </Button>
            )}
            
            {onEditParams && (
              <Button onClick={onEditParams} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Alterar Parâmetros
              </Button>
            )}

            {onRegenerate && (
              <Button onClick={onRegenerate} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Gerar Novo Plano
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MealPlanDisplay;
