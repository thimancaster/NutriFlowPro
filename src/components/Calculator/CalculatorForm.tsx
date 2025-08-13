
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, Loader2, Lock } from 'lucide-react';
import { useCalculationQuota } from '@/hooks/useCalculationQuota';
import BasicInfoForm from './BasicInfoForm';
import NutritionalResultsDisplay from './NutritionalResultsDisplay';
import { Patient, ConsultationData } from '@/types';
import { calculateNutritionalNeeds } from '@/utils/nutritionCalculations';

interface CalculatorFormProps {
  patient: Patient;
  onCalculate: (data: ConsultationData) => Promise<void>;
  isCalculating: boolean;
  disabled?: boolean;
}

const CalculatorForm: React.FC<CalculatorFormProps> = ({
  patient,
  onCalculate,
  isCalculating,
  disabled = false
}) => {
  const { canCalculate, quotaStatus, isPremium, attemptsRemaining } = useCalculationQuota();
  const [formData, setFormData] = useState<Partial<ConsultationData>>({});
  const [calculationResults, setCalculationResults] = useState<ConsultationData | null>(null);

  const handleFormChange = (data: Partial<ConsultationData>) => {
    setFormData(data);
    
    // Auto-calculate when we have all required fields
    if (data.weight && data.height && data.age && data.gender && data.activity_level && data.goal) {
      const results = calculateNutritionalNeeds({
        weight: Number(data.weight),
        height: Number(data.height),
        age: Number(data.age),
        gender: data.gender,
        activity_level: data.activity_level,
        goal: data.goal
      });
      
      setCalculationResults({
        ...data,
        ...results,
        patient: patient,
        tipo: 'primeira_consulta'
      } as ConsultationData);
    }
  };

  const handleSaveCalculation = async () => {
    if (calculationResults) {
      await onCalculate(calculationResults);
    }
  };

  const isFormComplete = formData.weight && formData.height && formData.age && 
                        formData.gender && formData.activity_level && formData.goal;
  
  const canSave = isFormComplete && calculationResults && canCalculate && !disabled;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Dados do Paciente: {patient.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <BasicInfoForm
            patient={patient}
            onFormChange={handleFormChange}
            disabled={isCalculating}
          />
        </CardContent>
      </Card>

      {calculationResults && (
        <NutritionalResultsDisplay data={calculationResults} />
      )}

      {isFormComplete && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {!canCalculate && !isPremium && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-center gap-2 text-amber-700">
                    <Lock className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Limite de cálculos gratuitos atingido ({quotaStatus?.attempts_used}/10)
                    </span>
                  </div>
                  <p className="text-sm text-amber-600 mt-1">
                    Faça upgrade para premium e tenha cálculos ilimitados!
                  </p>
                </div>
              )}
              
              <Button
                onClick={handleSaveCalculation}
                disabled={!canSave || isCalculating}
                className="w-full"
                size="lg"
              >
                {isCalculating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando cálculo...
                  </>
                ) : !canCalculate ? (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Limite atingido - Faça upgrade
                  </>
                ) : (
                  <>
                    <Calculator className="mr-2 h-4 w-4" />
                    Salvar Cálculo
                    {!isPremium && (
                      <span className="ml-2 text-xs opacity-70">
                        ({attemptsRemaining} restantes)
                      </span>
                    )}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CalculatorForm;
