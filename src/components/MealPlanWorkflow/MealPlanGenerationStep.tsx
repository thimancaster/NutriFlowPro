
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Utensils, Loader2, ArrowLeft } from 'lucide-react';
import { useMealPlanWorkflow } from '@/contexts/MealPlanWorkflowContext';
import { Patient, ConsultationData } from '@/types';

interface MealPlanGenerationStepProps {
  patient: Patient | null;
  calculationData: ConsultationData | null;
  onGenerate: () => Promise<void>;
  onBack: () => void;
}

const MealPlanGenerationStep: React.FC<MealPlanGenerationStepProps> = ({
  patient,
  calculationData,
  onGenerate,
  onBack
}) => {
  const { isGenerating } = useMealPlanWorkflow();

  if (!patient || !calculationData) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-red-600">Dados necessários não encontrados</p>
          <Button onClick={onBack} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Utensils className="h-5 w-5" />
          Gerar Plano Alimentar Inteligente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Patient and Calculation Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Paciente</h3>
            <p className="text-blue-700">{patient.name}</p>
            {patient.gender && (
              <p className="text-blue-600 text-sm">
                {patient.gender === 'male' ? 'Masculino' : 'Feminino'}
              </p>
            )}
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">Necessidades Nutricionais</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-green-700">Calorias:</span>
                <Badge variant="outline" className="ml-1">
                  {calculationData.totalCalories} kcal
                </Badge>
              </div>
              <div>
                <span className="text-green-700">Proteínas:</span>
                <Badge variant="outline" className="ml-1">
                  {calculationData.protein}g
                </Badge>
              </div>
              <div>
                <span className="text-green-700">Carboidratos:</span>
                <Badge variant="outline" className="ml-1">
                  {calculationData.carbs}g
                </Badge>
              </div>
              <div>
                <span className="text-green-700">Gorduras:</span>
                <Badge variant="outline" className="ml-1">
                  {calculationData.fats}g
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Generation Info */}
        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="text-sm text-yellow-800">
            <p className="font-medium mb-2">🧠 Inteligência Cultural Brasileira:</p>
            <ul className="space-y-1">
              <li>• Café da manhã: Pães, cereais, frutas e laticínios</li>
              <li>• Almoço: Arroz, feijão, carnes e verduras</li>
              <li>• Jantar: Refeições mais leves e saudáveis</li>
              <li>• Lanches: Frutas, iogurtes e oleaginosas</li>
            </ul>
          </div>
        </div>

        {/* Generation Actions */}
        <div className="flex gap-4 justify-center">
          <Button
            onClick={onGenerate}
            disabled={isGenerating}
            size="lg"
            className="min-w-[200px]"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando plano...
              </>
            ) : (
              <>
                <Utensils className="mr-2 h-4 w-4" />
                Gerar Plano Alimentar
              </>
            )}
          </Button>
          
          <Button variant="outline" onClick={onBack} disabled={isGenerating}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>

        {isGenerating && (
          <div className="text-center text-sm text-gray-600">
            <p>Gerando plano alimentar personalizado...</p>
            <p className="mt-1">Isso pode levar alguns segundos.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MealPlanGenerationStep;
