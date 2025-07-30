
import React from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { usePatient } from '@/contexts/patient/PatientContext';
import { ENPCalculatorInterface } from './ENPCalculatorInterface';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, Calculator } from 'lucide-react';
import { useCalculator } from '@/hooks/useCalculator';

const CalculatorTool: React.FC = () => {
  const { user } = useAuth();
  const { activePatient } = usePatient();
  const { results } = useCalculator();

  const handleExportResults = () => {
    if (!results) return;
    
    const exportData = {
      system: 'ENP - Engenharia Nutricional Padrão',
      timestamp: new Date().toISOString(),
      patient: activePatient ? { 
        id: activePatient.id, 
        name: activePatient.name 
      } : null,
      professional: user?.email,
      results: results,
      formula: 'Harris-Benedict Revisada (ENP)',
      standardDistribution: 'Café 25% | Lanche M 10% | Almoço 30% | Lanche T 10% | Jantar 20% | Ceia 5%'
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `enp-calculo-${activePatient?.name || 'paciente'}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header ENP */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl text-blue-800">
            <Calculator className="h-8 w-8 mr-3" />
            Sistema ENP - Engenharia Nutricional Padrão
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-700">
              <strong>Calculadora Oficial ENP:</strong> Utiliza exclusivamente a fórmula Harris-Benedict Revisada,
              fatores de atividade padronizados e distribuição fixa de macronutrientes conforme especificação ENP.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Status do Sistema */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-4">
            <div className="text-sm text-green-700">
              <strong>✅ TMB:</strong> Harris-Benedict Revisada
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-4">
            <div className="text-sm text-green-700">
              <strong>✅ Fatores:</strong> ENP Padronizados
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-4">
            <div className="text-sm text-green-700">
              <strong>✅ Macros:</strong> 1.8g/kg + 25% Gordura
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interface Principal ENP */}
      <ENPCalculatorInterface 
        onExportResults={handleExportResults}
      />

      {/* Export Button */}
      {results && (
        <div className="flex justify-end">
          <button
            onClick={handleExportResults}
            className="bg-nutri-blue text-white px-4 py-2 rounded hover:bg-nutri-blue-dark transition-colors"
          >
            Exportar Resultados
          </button>
        </div>
      )}
    </div>
  );
};

export default CalculatorTool;
