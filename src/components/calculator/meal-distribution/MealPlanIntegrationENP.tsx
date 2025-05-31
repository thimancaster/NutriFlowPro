
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ChefHat, Download } from 'lucide-react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { usePatient } from '@/contexts/patient/PatientContext';

interface MealPlanIntegrationENPProps {
  vet: number;
  macros: {
    protein: { grams: number; kcal: number };
    carbs: { grams: number; kcal: number };
    fat: { grams: number; kcal: number };
  };
  weight: number;
  onGenerateMealPlan: () => void;
  onExportResults: () => void;
  isGenerating?: boolean;
}

export const MealPlanIntegrationENP: React.FC<MealPlanIntegrationENPProps> = ({
  vet,
  macros,
  weight,
  onGenerateMealPlan,
  onExportResults,
  isGenerating = false
}) => {
  const { user } = useAuth();
  const { activePatient } = usePatient();
  
  const canGenerateMealPlan = user && activePatient && vet > 0;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <ChefHat className="h-5 w-5 mr-2" />
          Próximos Passos ENP
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Resumo para Plano Alimentar */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-2">Meta Nutricional ENP</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-600">VET Diário</div>
              <div className="font-semibold text-blue-600">{vet} kcal</div>
            </div>
            <div>
              <div className="text-gray-600">Proteína/kg</div>
              <div className="font-semibold">{(macros.protein.grams / weight).toFixed(1)} g/kg</div>
            </div>
            <div>
              <div className="text-gray-600">Proteína Total</div>
              <div className="font-semibold">{macros.protein.grams}g ({((macros.protein.kcal / vet) * 100).toFixed(0)}%)</div>
            </div>
            <div>
              <div className="text-gray-600">Carboidratos</div>
              <div className="font-semibold">{macros.carbs.grams}g ({((macros.carbs.kcal / vet) * 100).toFixed(0)}%)</div>
            </div>
            <div>
              <div className="text-gray-600">Gorduras</div>
              <div className="font-semibold">{macros.fat.grams}g ({((macros.fat.kcal / vet) * 100).toFixed(0)}%)</div>
            </div>
          </div>
        </div>

        {/* Status do Paciente */}
        {activePatient && (
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            <strong>Paciente:</strong> {activePatient.name}
            <br />
            <strong>Profissional:</strong> {user?.email}
          </div>
        )}

        {/* Ações */}
        <div className="space-y-3">
          <Button
            onClick={onGenerateMealPlan}
            disabled={!canGenerateMealPlan || isGenerating}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <span className="flex items-center">
                <span className="animate-spin h-4 w-4 mr-2 border-2 border-dashed rounded-full border-current"></span>
                Gerando Plano ENP...
              </span>
            ) : (
              <span className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                Gerar Plano Alimentar ENP
              </span>
            )}
          </Button>
          
          <Button
            onClick={onExportResults}
            variant="outline"
            className="w-full"
          >
            <Download className="mr-2 h-4 w-4" />
            Exportar Resultados ENP
          </Button>
        </div>

        {/* Informações ENP */}
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
          <strong>Sistema ENP:</strong> O plano alimentar será gerado seguindo a distribuição padrão de 6 refeições 
          com proporções otimizadas para metabolismo e adesão do paciente.
        </div>

        {!canGenerateMealPlan && (
          <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
            {!activePatient && "⚠️ Selecione um paciente para gerar o plano alimentar"}
            {!user && "⚠️ Faça login para acessar esta funcionalidade"}
            {activePatient && user && vet <= 0 && "⚠️ Complete o cálculo ENP primeiro"}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
