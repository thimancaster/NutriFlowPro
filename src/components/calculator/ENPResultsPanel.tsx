
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Utensils } from 'lucide-react';

interface ENPResultsPanelProps {
  results: {
    tmb: number;
    get: number;
    vet: number;
    adjustment: number;
    macros: {
      protein: { grams: number; kcal: number };
      carbs: { grams: number; kcal: number };
      fat: { grams: number; kcal: number };
    };
  };
  weight: number;
  onExportResults: () => void;
  isGeneratingMealPlan?: boolean;
}

export const ENPResultsPanel: React.FC<ENPResultsPanelProps> = ({
  results,
  weight,
  onExportResults,
  isGeneratingMealPlan = false
}) => {
  // Calcular proteína por kg
  const proteinPerKg = Math.round((results.macros.protein.grams / weight) * 10) / 10;
  
  // Calcular percentuais dos macronutrientes
  const totalKcal = results.macros.protein.kcal + results.macros.carbs.kcal + results.macros.fat.kcal;
  const proteinPercent = Math.round((results.macros.protein.kcal / totalKcal) * 100);
  const carbsPercent = Math.round((results.macros.carbs.kcal / totalKcal) * 100);
  const fatPercent = Math.round((results.macros.fat.kcal / totalKcal) * 100);

  return (
    <div className="space-y-6">
      {/* Seção Principal de Resultados */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center text-lg text-blue-800">
            🎯 Próximos Passos ENP
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Meta Nutricional */}
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <h3 className="font-semibold text-gray-900 mb-3">Meta Nutricional ENP</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">VET Diário</div>
                <div className="text-xl font-bold text-blue-600">{results.vet} kcal</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Proteína/kg</div>
                <div className="text-xl font-bold text-green-600">{proteinPerKg} g/kg</div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-600">Proteína Total</div>
                <div className="font-semibold text-gray-900">
                  {results.macros.protein.grams}g ({proteinPercent}%)
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Carboidratos</div>
                <div className="font-semibold text-gray-900">
                  {results.macros.carbs.grams}g ({carbsPercent}%)
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Gorduras</div>
                <div className="font-semibold text-gray-900">
                  {results.macros.fat.grams}g ({fatPercent}%)
                </div>
              </div>
            </div>
          </div>

          {/* Informações do Paciente e Profissional */}
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <strong>Paciente:</strong> {/* Este seria preenchido com o nome do paciente ativo */}
            </div>
            <div>
              <strong>Profissional:</strong> {/* Este seria preenchido com o nome do profissional */}
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="space-y-3 pt-4">
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isGeneratingMealPlan}
            >
              <Utensils className="h-4 w-4 mr-2" />
              {isGeneratingMealPlan ? 'Gerando...' : 'Gerar Plano Alimentar ENP'}
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full border-gray-300 hover:bg-gray-50"
              onClick={onExportResults}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar Resultados ENP
            </Button>
          </div>

          {/* Nota do Sistema ENP */}
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border">
            <strong>Sistema ENP:</strong> O plano alimentar será gerado seguindo a distribuição padrão de 6 refeições com proporções otimizadas para metabolismo e adesão do paciente.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
