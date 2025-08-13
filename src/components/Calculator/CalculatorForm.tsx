
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, Loader2, Lock } from 'lucide-react';
import { useCalculationQuota } from '@/hooks/useCalculationQuota';
import BasicInfoForm from './BasicInfoForm';
import NutritionalResultsDisplay from './NutritionalResultsDisplay';
import { Patient, ConsultationData } from '@/types';

// Simple calculation function - replace with actual calculation logic
const calculateNutritionalNeeds = (data: any) => {
  const weight = Number(data.weight);
  const height = Number(data.height);
  const age = Number(data.age);
  
  // Harris-Benedict equation for BMR
  let bmr;
  if (data.gender === 'male') {
    bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
  } else {
    bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
  }
  
  // Activity factor
  const activityFactors = {
    'sedentary': 1.2,
    'lightly_active': 1.375,
    'moderately_active': 1.55,
    'very_active': 1.725,
    'extra_active': 1.9
  };
  
  const tdee = bmr * (activityFactors[data.activity_level as keyof typeof activityFactors] || 1.2);
  
  // Basic macro calculation
  const protein = weight * 2.2; // 2.2g per kg
  const fats = weight * 1; // 1g per kg
  const carbsCalories = tdee - (protein * 4) - (fats * 9);
  const carbs = carbsCalories / 4;
  
  return { bmr, tdee, protein, carbs, fats };
};

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
        totalCalories: results.tdee
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
