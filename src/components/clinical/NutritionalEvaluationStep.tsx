
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calculator, TrendingUp, Activity, Target, ArrowRight } from 'lucide-react';
import { useConsultationData } from '@/contexts/ConsultationDataContext';
import { useToast } from '@/hooks/use-toast';
import { calculateNutritionalNeeds } from '@/utils/nutritionalCalculations';

const NutritionalEvaluationStep: React.FC = () => {
  const { 
    selectedPatient, 
    consultationData, 
    updateConsultationData, 
    setCurrentStep 
  } = useConsultationData();
  const { toast } = useToast();
  const [isCalculating, setIsCalculating] = useState(false);
  const [results, setResults] = useState(null);

  // Check if we already have results
  useEffect(() => {
    if (consultationData?.results) {
      setResults(consultationData.results);
    }
  }, [consultationData?.results]);

  const handleCalculateNeeds = async () => {
    if (!selectedPatient || !consultationData) {
      toast({
        title: 'Dados incompletos',
        description: 'Complete os dados do paciente primeiro.',
        variant: 'destructive'
      });
      return;
    }

    setIsCalculating(true);
    
    try {
      // Perform nutritional calculations
      const calculationResults = calculateNutritionalNeeds({
        weight: consultationData.weight || 0,
        height: consultationData.height || 0,
        age: consultationData.age || 0,
        gender: consultationData.gender || 'female',
        activityLevel: consultationData.activity_level || 'moderado',
        objective: consultationData.objective || 'manutenção'
      });

      // Update consultation data with results
      const updatedData = {
        ...consultationData,
        bmr: calculationResults.bmr,
        tdee: calculationResults.get,
        totalCalories: calculationResults.vet,
        protein: calculationResults.macros.protein,
        carbs: calculationResults.macros.carbs,
        fats: calculationResults.macros.fat,
        results: {
          bmr: calculationResults.bmr,
          get: calculationResults.get,
          vet: calculationResults.vet,
          adjustment: calculationResults.adjustment,
          macros: calculationResults.macros
        }
      };

      updateConsultationData(updatedData);
      setResults(calculationResults);

      toast({
        title: 'Cálculo realizado!',
        description: 'Necessidades nutricionais calculadas com sucesso.',
      });

      // Auto-advance to next step after successful calculation
      setTimeout(() => {
        setCurrentStep('meal-plan');
      }, 1500);

    } catch (error) {
      console.error('Error calculating nutritional needs:', error);
      toast({
        title: 'Erro no cálculo',
        description: 'Não foi possível calcular as necessidades nutricionais.',
        variant: 'destructive'
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const handleAdvanceToMealPlan = () => {
    setCurrentStep('meal-plan');
  };

  if (!selectedPatient || !consultationData) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Complete os dados do paciente para continuar</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-nutri-green" />
            Avaliação Nutricional
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Patient Summary */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Dados do Paciente: {selectedPatient.name}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Peso:</span>
                <div className="font-medium">{consultationData.weight} kg</div>
              </div>
              <div>
                <span className="text-muted-foreground">Altura:</span>
                <div className="font-medium">{consultationData.height} cm</div>
              </div>
              <div>
                <span className="text-muted-foreground">Idade:</span>
                <div className="font-medium">{consultationData.age} anos</div>
              </div>
              <div>
                <span className="text-muted-foreground">Sexo:</span>
                <div className="font-medium">
                  {consultationData.gender === 'male' ? 'Masculino' : 'Feminino'}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="outline">
                Atividade: {consultationData.activity_level}
              </Badge>
              <Badge variant="outline">
                Objetivo: {consultationData.objective}
              </Badge>
            </div>
          </div>

          {/* Calculation Button */}
          {!results && (
            <div className="text-center">
              <Button 
                onClick={handleCalculateNeeds}
                disabled={isCalculating}
                className="bg-nutri-green hover:bg-nutri-green-dark"
                size="lg"
              >
                {isCalculating ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Calculando...
                  </>
                ) : (
                  <>
                    <Calculator className="mr-2 h-4 w-4" />
                    Calcular Necessidades Nutricionais
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Results Display */}
          {results && (
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h4 className="font-medium text-green-900 dark:text-green-100 mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Resultados dos Cálculos
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-green-900/30 p-3 rounded border">
                    <div className="text-sm text-muted-foreground">TMB (Taxa Metabólica Basal)</div>
                    <div className="text-lg font-bold text-green-700 dark:text-green-300">
                      {results.bmr} kcal
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-green-900/30 p-3 rounded border">
                    <div className="text-sm text-muted-foreground">GET (Gasto Energético Total)</div>
                    <div className="text-lg font-bold text-green-700 dark:text-green-300">
                      {results.get} kcal
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-green-900/30 p-3 rounded border">
                    <div className="text-sm text-muted-foreground">VET (Valor Energético Total)</div>
                    <div className="text-lg font-bold text-green-700 dark:text-green-300">
                      {results.vet} kcal
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <h5 className="font-medium mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Distribuição de Macronutrientes
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-white dark:bg-green-900/30 p-3 rounded border">
                      <div className="text-sm text-muted-foreground">Proteínas</div>
                      <div className="font-bold text-green-700 dark:text-green-300">
                        {results.macros.protein}g
                      </div>
                    </div>
                    <div className="bg-white dark:bg-green-900/30 p-3 rounded border">
                      <div className="text-sm text-muted-foreground">Carboidratos</div>
                      <div className="font-bold text-green-700 dark:text-green-300">
                        {results.macros.carbs}g
                      </div>
                    </div>
                    <div className="bg-white dark:bg-green-900/30 p-3 rounded border">
                      <div className="text-sm text-muted-foreground">Gorduras</div>
                      <div className="font-bold text-green-700 dark:text-green-300">
                        {results.macros.fat}g
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Advance Button */}
              <div className="text-center">
                <Button 
                  onClick={handleAdvanceToMealPlan}
                  className="bg-nutri-orange hover:bg-nutri-orange-dark"
                  size="lg"
                >
                  <Utensils className="mr-2 h-4 w-4" />
                  Avançar para Plano Alimentar
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NutritionalEvaluationStep;
