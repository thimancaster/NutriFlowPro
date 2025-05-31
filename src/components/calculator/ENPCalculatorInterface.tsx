
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calculator, Info } from 'lucide-react';
import { ENPDataInputs } from './inputs/ENPDataInputs';
import { ENPValidation } from './validation/ENPValidation';
import { ENPResultsPanel } from './ENPResultsPanel';
import { useCalculator } from '@/hooks/useCalculator';
import { ActivityLevel, Objective } from '@/types/consultation';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ENPCalculatorInterfaceProps {
  onCalculationComplete?: (results: any) => void;
  onGenerateMealPlan?: () => void;
  onExportResults?: () => void;
}

export const ENPCalculatorInterface: React.FC<ENPCalculatorInterfaceProps> = ({
  onCalculationComplete,
  onGenerateMealPlan,
  onExportResults
}) => {
  // Estados para os 6 campos obrigatórios ENP
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState<'M' | 'F'>('M');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderado');
  const [objective, setObjective] = useState<Objective>('manutenção');
  
  const calculator = useCalculator();
  
  // Validação ENP
  const validateData = () => {
    return {
      weight: parseFloat(weight) || 0,
      height: parseFloat(height) || 0,
      age: parseFloat(age) || 0,
      sex,
      activityLevel,
      objective
    };
  };
  
  const data = validateData();
  const isValid = data.weight > 0 && data.height > 0 && data.age > 0;
  
  const handleCalculate = async () => {
    if (!isValid) return;
    
    try {
      const result = await calculator.calculate(
        data.weight,
        data.height,
        data.age,
        data.sex,
        data.activityLevel,
        data.objective,
        'eutrofico' // Profile padrão - será ajustado pelo nutricionista se necessário
      );
      
      if (result && onCalculationComplete) {
        onCalculationComplete(result);
      }
    } catch (error) {
      console.error('Erro no cálculo ENP:', error);
    }
  };

  const handleGenerateMealPlan = () => {
    if (onGenerateMealPlan) {
      onGenerateMealPlan();
    }
  };

  const handleExportResults = () => {
    if (onExportResults) {
      onExportResults();
    } else {
      // Funcionalidade de exportação padrão
      const exportData = {
        timestamp: new Date().toISOString(),
        patient: { weight: data.weight, height: data.height, age: data.age, sex: data.sex },
        parameters: { activityLevel: data.activityLevel, objective: data.objective },
        results: calculator.results
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `calculo-enp-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Informações sobre ENP */}
      <Alert className="border-blue-200 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-700">
          <strong>Sistema ENP:</strong> Cálculos baseados na Engenharia Nutricional Padrão.
          Utiliza Harris-Benedict Revisada, fatores de atividade padronizados e ajustes calóricos fixos.
        </AlertDescription>
      </Alert>
      
      {/* Inputs de dados */}
      <ENPDataInputs
        weight={weight}
        setWeight={setWeight}
        height={height}
        setHeight={setHeight}
        age={age}
        setAge={setAge}
        sex={sex}
        setSex={setSex}
        activityLevel={activityLevel}
        setActivityLevel={setActivityLevel}
        objective={objective}
        setObjective={setObjective}
      />
      
      {/* Validação */}
      <ENPValidation data={data} />
      
      {/* Botão de cálculo */}
      <Card>
        <CardContent className="pt-6">
          <Button
            onClick={handleCalculate}
            disabled={!isValid || calculator.isCalculating}
            className="w-full"
            size="lg"
          >
            {calculator.isCalculating ? (
              <span className="flex items-center">
                <span className="animate-spin h-4 w-4 mr-2 border-2 border-dashed rounded-full border-current"></span>
                Calculando ENP...
              </span>
            ) : (
              <span className="flex items-center">
                <Calculator className="mr-2 h-4 w-4" />
                Calcular com ENP
              </span>
            )}
          </Button>
          
          {calculator.error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{calculator.error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
      
      {/* Resultados ENP */}
      {calculator.results && (
        <ENPResultsPanel
          results={calculator.results}
          weight={data.weight}
          onGenerateMealPlan={handleGenerateMealPlan}
          onExportResults={handleExportResults}
        />
      )}
    </div>
  );
};
