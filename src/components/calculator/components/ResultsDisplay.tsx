
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from '@/contexts/auth/AuthContext';
import { CreateCalculationHistory } from '@/services/calculationHistoryService';
import SaveCalculationDialog from '../SaveCalculationDialog';
import { Calculator, TrendingUp, Target, Activity } from 'lucide-react';

interface ResultsDisplayProps {
  teeObject: {
    get: number;
    adjustment: number;
    vet: number;
  } | null;
  macros: {
    protein: { grams: number; kcal: number; percentage: number };
    carbs: { grams: number; kcal: number; percentage: number };
    fat: { grams: number; kcal: number; percentage: number };
    proteinPerKg: number;
  } | null;
  calorieSummary: any;
  objective: string;
  onSavePatient: () => Promise<void>;
  onGenerateMealPlan: () => Promise<void>;
  isSaving: boolean;
  
  // Additional props for calculation history
  patientId?: string;
  weight?: number;
  height?: number;
  age?: number;
  sex?: 'M' | 'F';
  bodyProfile?: string;
  activityLevel?: string;
  tmb?: number;
  formulaUsed?: string;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  teeObject,
  macros,
  calorieSummary,
  objective,
  onSavePatient,
  onGenerateMealPlan,
  isSaving,
  patientId,
  weight,
  height,
  age,
  sex,
  bodyProfile,
  activityLevel,
  tmb,
  formulaUsed
}) => {
  const { user } = useAuth();

  if (!teeObject || !macros) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Complete os cálculos para ver os resultados</p>
        </CardContent>
      </Card>
    );
  }

  // Prepare calculation data for history saving
  const calculationData: CreateCalculationHistory | undefined = patientId && weight && height && age && sex && bodyProfile && activityLevel && tmb && formulaUsed ? {
    patient_id: patientId,
    weight,
    height,
    age,
    sex,
    body_profile: bodyProfile,
    activity_level: activityLevel,
    objective,
    tmb,
    get: teeObject.get,
    vet: teeObject.vet,
    protein_g: macros.protein.grams,
    carbs_g: macros.carbs.grams,
    fat_g: macros.fat.grams,
    protein_kcal: macros.protein.kcal,
    carbs_kcal: macros.carbs.kcal,
    fat_kcal: macros.fat.kcal,
    formula_used: formulaUsed
  } : undefined;

  const getObjectiveBadgeColor = (obj: string) => {
    switch (obj.toLowerCase()) {
      case 'emagrecimento':
        return 'bg-red-100 text-red-800';
      case 'hipertrofia':
        return 'bg-green-100 text-green-800';
      case 'manutenção':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with objective */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Resultados do Cálculo Nutricional
            </CardTitle>
            <Badge className={getObjectiveBadgeColor(objective)}>
              {objective}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Main Results */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-medium text-gray-500 mb-1">Taxa Metabólica Basal</h3>
            <p className="text-3xl font-bold text-blue-600">{tmb}</p>
            <p className="text-sm text-gray-500">kcal/dia</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Activity className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-medium text-gray-500 mb-1">Gasto Energético Total</h3>
            <p className="text-3xl font-bold text-green-600">{teeObject.get}</p>
            <p className="text-sm text-gray-500">kcal/dia</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h3 className="font-medium text-gray-500 mb-1">Valor Energético Total</h3>
            <p className="text-3xl font-bold text-purple-600">{teeObject.vet}</p>
            <p className="text-sm text-gray-500">kcal/dia</p>
            {teeObject.adjustment !== 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {teeObject.adjustment > 0 ? '+' : ''}{teeObject.adjustment} kcal
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Macronutrients */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Macronutrientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-800">Proteínas</h4>
                <p className="text-2xl font-bold text-blue-600">{macros.protein.grams}g</p>
                <p className="text-sm text-blue-600">{macros.protein.kcal} kcal ({macros.protein.percentage}%)</p>
                <p className="text-xs text-gray-500 mt-1">{macros.proteinPerKg.toFixed(1)}g/kg</p>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-medium text-green-800">Carboidratos</h4>
                <p className="text-2xl font-bold text-green-600">{macros.carbs.grams}g</p>
                <p className="text-sm text-green-600">{macros.carbs.kcal} kcal ({macros.carbs.percentage}%)</p>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-amber-50 rounded-lg p-4">
                <h4 className="font-medium text-amber-800">Gorduras</h4>
                <p className="text-2xl font-bold text-amber-600">{macros.fat.grams}g</p>
                <p className="text-sm text-amber-600">{macros.fat.kcal} kcal ({macros.fat.percentage}%)</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 justify-center">
        {calculationData && (
          <SaveCalculationDialog calculationData={calculationData} />
        )}
        
        <Button 
          onClick={onSavePatient}
          disabled={isSaving}
          className="flex items-center gap-2"
        >
          {isSaving ? 'Salvando...' : 'Salvar Paciente'}
        </Button>
        
        <Button 
          variant="outline"
          onClick={onGenerateMealPlan}
          className="flex items-center gap-2"
        >
          Gerar Plano Alimentar
        </Button>
      </div>
    </div>
  );
};

export default ResultsDisplay;
