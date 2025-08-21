
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConsolidatedMealPlan, MEAL_ORDER, MEAL_TYPES } from '@/types/mealPlanTypes';
import { useConsolidatedMealPlan } from '@/hooks/useConsolidatedMealPlan';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FileText, Printer, RefreshCw } from 'lucide-react';

interface ConsolidatedMealPlanEditorProps {
  mealPlan: ConsolidatedMealPlan;
  patientName?: string;
  patientAge?: number;
  patientGender?: 'male' | 'female';
  onUpdate?: (updatedPlan: ConsolidatedMealPlan) => void;
}

const ConsolidatedMealPlanEditor: React.FC<ConsolidatedMealPlanEditorProps> = ({
  mealPlan,
  patientName,
  patientAge,
  patientGender,
  onUpdate
}) => {
  const { downloadPDF, printPDF, isLoading } = useConsolidatedMealPlan();
  const [currentPlan, setCurrentPlan] = useState<ConsolidatedMealPlan>(mealPlan);

  useEffect(() => {
    setCurrentPlan(mealPlan);
  }, [mealPlan]);

  const handleDownloadPDF = () => {
    downloadPDF(currentPlan, patientName, patientAge, patientGender);
  };

  const handlePrintPDF = () => {
    printPDF(currentPlan, patientName, patientAge, patientGender);
  };

  const getMealConfig = (mealType: string) => {
    const configs = {
      cafe_da_manha: { color: 'bg-orange-100', icon: '☕' },
      lanche_manha: { color: 'bg-yellow-100', icon: '🍎' },
      almoco: { color: 'bg-green-100', icon: '🍽️' },
      lanche_tarde: { color: 'bg-blue-100', icon: '🥪' },
      jantar: { color: 'bg-purple-100', icon: '🍲' },
      ceia: { color: 'bg-pink-100', icon: '🥛' }
    };
    return configs[mealType as keyof typeof configs] || { color: 'bg-gray-100', icon: '🍴' };
  };

  return (
    <div className="space-y-6">
      {/* Header do Plano */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              🇧🇷 Plano Alimentar Brasileiro - {patientName}
              <span className="text-sm font-normal text-muted-foreground">
                {format(new Date(currentPlan.date), 'dd/MM/yyyy', { locale: ptBR })}
              </span>
            </CardTitle>
            
            <div className="flex gap-2">
              <Badge variant="outline" className="text-lg">
                {currentPlan.total_calories.toFixed(0)} kcal
              </Badge>
              <Badge variant="outline">P: {currentPlan.total_protein.toFixed(0)}g</Badge>
              <Badge variant="outline">C: {currentPlan.total_carbs.toFixed(0)}g</Badge>
              <Badge variant="outline">G: {currentPlan.total_fats.toFixed(0)}g</Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex gap-3">
            <Button 
              onClick={handleDownloadPDF}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Baixar PDF
            </Button>
            
            <Button 
              onClick={handlePrintPDF}
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              Imprimir
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Refeições */}
      <div className="grid gap-4">
        {MEAL_ORDER.map((mealType) => {
          const meal = currentPlan.meals.find(m => m.type === mealType);
          if (!meal) return null;
          
          const config = getMealConfig(mealType);
          
          return (
            <Card key={mealType} className={`${config.color} border-l-4 border-l-primary`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="text-2xl">{config.icon}</span>
                    {meal.name}
                    <span className="text-sm font-normal text-muted-foreground">
                      {meal.time}
                    </span>
                  </CardTitle>
                  
                  <div className="flex gap-2">
                    <Badge variant="secondary">
                      {meal.total_calories.toFixed(0)} kcal
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {((meal.total_calories / currentPlan.total_calories) * 100).toFixed(0)}%
                    </Badge>
                  </div>
                </div>
                
                <div className="flex gap-3 text-sm">
                  <Badge variant="outline" className="bg-orange-50">
                    P: {meal.total_protein.toFixed(1)}g
                  </Badge>
                  <Badge variant="outline" className="bg-yellow-50">
                    C: {meal.total_carbs.toFixed(1)}g
                  </Badge>
                  <Badge variant="outline" className="bg-blue-50">
                    G: {meal.total_fats.toFixed(1)}g
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                {meal.items.length > 0 ? (
                  <div className="space-y-2">
                    {meal.items.map((item, index) => (
                      <div 
                        key={item.id || index} 
                        className="flex items-center justify-between p-3 bg-white rounded-lg border"
                      >
                        <div className="flex-1">
                          <div className="font-medium">{item.food_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {item.quantity} {item.unit}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="font-medium">{item.calories.toFixed(0)} kcal</div>
                          <div className="text-xs text-muted-foreground">
                            P: {item.protein.toFixed(1)}g • 
                            C: {item.carbs.toFixed(1)}g • 
                            G: {item.fats.toFixed(1)}g
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-4">
                    <p>Nenhum alimento definido para esta refeição</p>
                    <p className="text-sm">Sugestão: consulte um nutricionista para personalização</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Resumo Nutricional */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo Nutricional Diário</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {currentPlan.total_calories.toFixed(0)}
              </div>
              <div className="text-sm text-green-700">Calorias Totais</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {currentPlan.total_protein.toFixed(0)}g
              </div>
              <div className="text-sm text-orange-700">
                Proteínas ({((currentPlan.total_protein * 4 / currentPlan.total_calories) * 100).toFixed(0)}%)
              </div>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {currentPlan.total_carbs.toFixed(0)}g
              </div>
              <div className="text-sm text-yellow-700">
                Carboidratos ({((currentPlan.total_carbs * 4 / currentPlan.total_calories) * 100).toFixed(0)}%)
              </div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {currentPlan.total_fats.toFixed(0)}g
              </div>
              <div className="text-sm text-blue-700">
                Gorduras ({((currentPlan.total_fats * 9 / currentPlan.total_calories) * 100).toFixed(0)}%)
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notas */}
      {currentPlan.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {currentPlan.notes}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ConsolidatedMealPlanEditor;
