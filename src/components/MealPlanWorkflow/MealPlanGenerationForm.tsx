
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Utensils } from 'lucide-react';

interface MealPlanGenerationFormProps {
  onGenerate: () => void;
  isGenerating?: boolean;
  canGenerate?: boolean;
  validationMessage?: string;
  patientName?: string;
  calculationData?: {
    totalCalories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
}

const MealPlanGenerationForm: React.FC<MealPlanGenerationFormProps> = ({ 
  onGenerate,
  isGenerating = false,
  canGenerate = true,
  validationMessage,
  patientName = 'Paciente',
  calculationData
}) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="text-center">
            <Utensils className="mx-auto h-12 w-12 text-primary mb-3" />
            <h3 className="text-lg font-semibold">Gerar Plano Alimentar Brasileiro</h3>
            <p className="text-muted-foreground">
              Configure os parâmetros para gerar um novo plano alimentar para <strong>{patientName}</strong>.
            </p>
          </div>

          {calculationData && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-900 mb-2">📊 Metas Nutricionais</h4>
              <div className="grid grid-cols-2 gap-2 text-sm text-green-700">
                <div>Calorias: <span className="font-medium">{calculationData.totalCalories} kcal</span></div>
                <div>Proteínas: <span className="font-medium">{calculationData.protein}g</span></div>
                <div>Carboidratos: <span className="font-medium">{calculationData.carbs}g</span></div>
                <div>Gorduras: <span className="font-medium">{calculationData.fats}g</span></div>
              </div>
            </div>
          )}

          {!canGenerate && validationMessage && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{validationMessage}</AlertDescription>
            </Alert>
          )}

          <Button 
            onClick={onGenerate} 
            disabled={!canGenerate || isGenerating}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando Plano com Inteligência Cultural...
              </>
            ) : (
              <>
                <Utensils className="mr-2 h-4 w-4" />
                Gerar Plano Alimentar Brasileiro
              </>
            )}
          </Button>

          {isGenerating && (
            <div className="text-center text-sm text-muted-foreground">
              <p>🧠 Aplicando inteligência cultural brasileira...</p>
              <p>🍽️ Criando refeições balanceadas...</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MealPlanGenerationForm;
