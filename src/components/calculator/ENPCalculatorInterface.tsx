
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calculator, Info } from 'lucide-react';
import { ENPDataInputs } from './inputs/ENPDataInputs';
import { ENPValidation } from './validation/ENPValidation';
import { useCalculator } from '@/hooks/useCalculator';
import { ActivityLevel, Objective } from '@/types/consultation';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ENPCalculatorInterfaceProps {
  onCalculationComplete?: (results: any) => void;
}

export const ENPCalculatorInterface: React.FC<ENPCalculatorInterfaceProps> = ({
  onCalculationComplete
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
      
      {/* Resumo dos Cálculos ENP */}
      {calculator.results && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados ENP</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>TMB:</strong> {calculator.results.tmb} kcal
                <div className="text-gray-500">Harris-Benedict Revisada</div>
              </div>
              <div>
                <strong>GET:</strong> {calculator.results.get} kcal
                <div className="text-gray-500">TMB × FA ({activityLevel})</div>
              </div>
              <div>
                <strong>VET:</strong> {calculator.results.vet} kcal
                <div className="text-gray-500">GET {calculator.results.adjustment >= 0 ? '+' : ''}{calculator.results.adjustment} kcal</div>
              </div>
              <div>
                <strong>Proteína:</strong> {calculator.results.macros.protein.grams}g
                <div className="text-gray-500">{calculator.results.macros.proteinPerKg}g/kg</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
