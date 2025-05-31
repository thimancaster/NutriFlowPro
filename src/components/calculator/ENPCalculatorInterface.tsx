
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calculator, Info, Settings } from 'lucide-react';
import { ENPDataInputs } from './inputs/ENPDataInputs';
import { ENPValidation } from './validation/ENPValidation';
import { ENPCalculationValidator } from './validation/ENPCalculationValidator';
import { ENPResultsPanel } from './ENPResultsPanel';
import { useCalculator } from '@/hooks/useCalculator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth/AuthContext';
import { usePatient } from '@/contexts/patient/PatientContext';
import { ActivityLevel, Objective } from '@/types/consultation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { activePatient } = usePatient();
  
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
    // Verificar se há resultados do cálculo
    if (!calculator.results) {
      toast({
        title: "Cálculo necessário",
        description: "Realize o cálculo ENP primeiro antes de gerar o plano alimentar.",
        variant: "destructive"
      });
      return;
    }

    // Verificar se há usuário logado
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para gerar planos alimentares.",
        variant: "destructive"
      });
      return;
    }

    // Verificar se há paciente selecionado
    if (!activePatient) {
      toast({
        title: "Paciente necessário",
        description: "Selecione um paciente para gerar o plano alimentar.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Navegar para o gerador de plano alimentar com os dados do cálculo
      navigate('/meal-plan-generator', {
        state: {
          calculationData: {
            tdee: calculator.results.vet,
            protein: calculator.results.macros.protein.grams,
            carbs: calculator.results.macros.carbs.grams,
            fats: calculator.results.macros.fat.grams,
            bmr: calculator.results.tmb,
            objective: data.objective
          },
          patientData: activePatient,
          systemType: 'ENP'
        }
      });

      toast({
        title: "Redirecionando...",
        description: "Preparando o gerador de plano alimentar ENP.",
      });

    } catch (error) {
      console.error('Erro ao navegar para plano alimentar:', error);
      toast({
        title: "Erro de navegação",
        description: "Não foi possível acessar o gerador de planos.",
        variant: "destructive"
      });
    }

    // Chamar callback customizado se fornecido
    if (onGenerateMealPlan) {
      onGenerateMealPlan();
    }
  };

  const handleExportResults = () => {
    if (!calculator.results) {
      toast({
        title: "Nenhum resultado",
        description: "Realize o cálculo ENP primeiro para exportar os resultados.",
        variant: "destructive"
      });
      return;
    }

    if (onExportResults) {
      onExportResults();
    } else {
      // Funcionalidade de exportação padrão
      const exportData = {
        system: 'ENP - Engenharia Nutricional Padrão',
        timestamp: new Date().toISOString(),
        patient: { 
          name: activePatient?.name || 'Paciente',
          weight: data.weight, 
          height: data.height, 
          age: data.age, 
          sex: data.sex 
        },
        parameters: { activityLevel: data.activityLevel, objective: data.objective },
        results: calculator.results,
        professional: user?.email || 'Nutricionista'
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `enp-calculo-${activePatient?.name || 'paciente'}-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Exportação concluída",
        description: "Resultados ENP exportados com sucesso.",
      });
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Informações sobre ENP */}
      <Alert className="border-blue-200 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-700">
          <strong>Sistema ENP v2.0:</strong> Implementação oficial da Engenharia Nutricional Padrão.
          Harris-Benedict Revisada • Fatores Fixos • Macros Padronizados • Distribuição 6 Refeições.
        </AlertDescription>
      </Alert>
      
      <Tabs defaultValue="calculator" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calculator">Calculadora ENP</TabsTrigger>
          <TabsTrigger value="validator">Validação Sistema</TabsTrigger>
        </TabsList>
        
        <TabsContent value="calculator" className="space-y-6">
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
                    Calculando com ENP...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Calculator className="mr-2 h-4 w-4" />
                    Calcular com ENP v2.0
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
        </TabsContent>
        
        <TabsContent value="validator">
          <ENPCalculationValidator />
        </TabsContent>
      </Tabs>
    </div>
  );
};
