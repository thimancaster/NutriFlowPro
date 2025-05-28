
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Save, Utensils, TrendingUp, TrendingDown, Minus, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCalculationHistory } from '@/hooks/useCalculationHistory';
import { useAuth } from '@/contexts/auth/AuthContext';

interface MacroValues {
  grams: number;
  kcal: number;
  percentage: number;
}

interface CalculatedMacros {
  protein: MacroValues;
  carbs: MacroValues;
  fat: MacroValues;
  proteinPerKg: number;
}

interface TEEObject {
  get: number;
  vet: number;
  adjustment: number;
}

interface CalorieSummary {
  targetCalories: number;
  actualCalories: number;
  difference: number;
  percentageDifference: number;
}

interface ResultsDisplayProps {
  teeObject: TEEObject;
  macros: CalculatedMacros;
  calorieSummary: CalorieSummary;
  objective: string;
  onSavePatient: () => Promise<void>;
  onGenerateMealPlan: () => void;
  isSaving: boolean;
  patientId?: string;
  weight?: number;
  height?: number;
  age?: number;
  sex: 'M' | 'F';
  bodyProfile: string;
  activityLevel: string;
  tmb?: number;
  formulaUsed: string;
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
  const { toast } = useToast();
  const { user } = useAuth();
  const { saveCalculation } = useCalculationHistory();
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [notes, setNotes] = useState('');

  const handleSaveCalculation = async () => {
    if (!patientId || !user?.id || !weight || !height || !age || !tmb) {
      toast({
        title: 'Dados incompletos',
        description: 'Verifique se todos os dados necessários estão preenchidos.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await saveCalculation({
        patient_id: patientId,
        user_id: user.id,
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
        formula_used: formulaUsed,
        notes
      });
      
      setShowSaveDialog(false);
      setNotes('');
    } catch (error) {
      console.error('Erro ao salvar cálculo:', error);
    }
  };

  const getCalorieDifferenceIcon = () => {
    if (calorieSummary.difference > 0) {
      return <TrendingUp className="h-4 w-4 text-red-500" />;
    } else if (calorieSummary.difference < 0) {
      return <TrendingDown className="h-4 w-4 text-green-500" />;
    }
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

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
      {/* Header com objetivo */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Resultados da Calculadora</h3>
        <Badge className={getObjectiveBadgeColor(objective)}>
          {objective}
        </Badge>
      </div>

      {/* Cards de resultados principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-500">GET (Gasto Energético Total)</p>
              <p className="text-2xl font-bold text-blue-600">{teeObject.get}</p>
              <p className="text-xs text-gray-400">kcal/dia</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-500">VET (Valor Energético Total)</p>
              <p className="text-2xl font-bold text-green-600">{teeObject.vet}</p>
              <p className="text-xs text-gray-400">kcal/dia</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                <p className="text-sm text-gray-500">Diferença Calórica</p>
                {getCalorieDifferenceIcon()}
              </div>
              <p className="text-2xl font-bold">{Math.abs(calorieSummary.difference)}</p>
              <p className="text-xs text-gray-400">kcal</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribuição de macronutrientes */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Macronutrientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-amber-50 rounded-lg">
              <p className="text-sm text-gray-600">Proteínas</p>
              <p className="text-xl font-bold text-amber-600">{macros.protein.grams}g</p>
              <p className="text-sm text-gray-500">{macros.protein.kcal} kcal</p>
              <p className="text-xs text-gray-400">{macros.protein.percentage}%</p>
              <p className="text-xs text-gray-400">{macros.proteinPerKg}g/kg</p>
            </div>

            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Carboidratos</p>
              <p className="text-xl font-bold text-blue-600">{macros.carbs.grams}g</p>
              <p className="text-sm text-gray-500">{macros.carbs.kcal} kcal</p>
              <p className="text-xs text-gray-400">{macros.carbs.percentage}%</p>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600">Gorduras</p>
              <p className="text-xl font-bold text-purple-600">{macros.fat.grams}g</p>
              <p className="text-sm text-gray-500">{macros.fat.kcal} kcal</p>
              <p className="text-xs text-gray-400">{macros.fat.percentage}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botões de ação */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={onSavePatient} disabled={isSaving} className="flex-1">
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Salvando...' : 'Salvar Paciente'}
        </Button>

        {patientId && (
          <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1">
                <FileText className="h-4 w-4 mr-2" />
                Salvar no Histórico
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Salvar Cálculo no Histórico</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label htmlFor="notes" className="text-sm font-medium">
                    Observações (opcional)
                  </label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Adicione observações sobre este cálculo..."
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveCalculation}>
                    Salvar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        <Button onClick={onGenerateMealPlan} variant="outline" className="flex-1">
          <Utensils className="h-4 w-4 mr-2" />
          Gerar Cardápio
        </Button>
      </div>
    </div>
  );
};

export default ResultsDisplay;
