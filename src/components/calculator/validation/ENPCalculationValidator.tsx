
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, TestTube } from 'lucide-react';
import { calculateCompleteENP, ENPInputs } from '@/utils/nutrition/enpCalculations';

interface TestCase {
  name: string;
  inputs: ENPInputs;
  expectedTMB: number;
  expectedGET: number;
  expectedProteinGrams: number;
}

const ENP_TEST_CASES: TestCase[] = [
  {
    name: 'Homem Adulto Moderado',
    inputs: {
      weight: 70,
      height: 175,
      age: 30,
      sex: 'M',
      activityLevel: 'moderado',
      objective: 'manter_peso'
    },
    expectedTMB: 1668,
    expectedGET: 2585,
    expectedProteinGrams: 126
  },
  {
    name: 'Mulher Adulta Sedentária',
    inputs: {
      weight: 60,
      height: 165,
      age: 25,
      sex: 'F',
      activityLevel: 'sedentario',
      objective: 'manter_peso'
    },
    expectedTMB: 1372,
    expectedGET: 1647,
    expectedProteinGrams: 108
  },
  {
    name: 'Emagrecimento Homem',
    inputs: {
      weight: 80,
      height: 180,
      age: 35,
      sex: 'M',
      activityLevel: 'leve',
      objective: 'perder_peso'
    },
    expectedTMB: 1789,
    expectedGET: 1960, // 2460 - 500
    expectedProteinGrams: 144
  }
];

export const ENPCalculationValidator: React.FC = () => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runValidationTests = async () => {
    setIsRunning(true);
    const results = [];

    for (const testCase of ENP_TEST_CASES) {
      try {
        const result = calculateCompleteENP(testCase.inputs);
        
        const tmbDiff = Math.abs(result.tmb - testCase.expectedTMB);
        const getDiff = Math.abs(result.get - testCase.expectedGET);
        const proteinDiff = Math.abs(result.macros.protein.grams - testCase.expectedProteinGrams);

        const passed = tmbDiff <= 5 && getDiff <= 20 && proteinDiff <= 5;

        results.push({
          name: testCase.name,
          passed,
          details: {
            tmb: { calculated: result.tmb, expected: testCase.expectedTMB, diff: tmbDiff },
            get: { calculated: result.get, expected: testCase.expectedGET, diff: getDiff },
            protein: { calculated: result.macros.protein.grams, expected: testCase.expectedProteinGrams, diff: proteinDiff }
          }
        });
      } catch (error) {
        results.push({
          name: testCase.name,
          passed: false,
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
      }
    }

    setTestResults(results);
    setIsRunning(false);
  };

  const allTestsPassed = testResults.length > 0 && testResults.every(r => r.passed);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TestTube className="h-5 w-5 mr-2" />
          Validador de Cálculos ENP
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Button
          onClick={runValidationTests}
          disabled={isRunning}
          className="w-full"
        >
          {isRunning ? (
            <span className="flex items-center">
              <span className="animate-spin h-4 w-4 mr-2 border-2 border-dashed rounded-full border-current"></span>
              Validando Cálculos ENP...
            </span>
          ) : (
            'Executar Testes de Validação ENP'
          )}
        </Button>

        {testResults.length > 0 && (
          <div className="space-y-3">
            <Alert className={allTestsPassed ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              {allTestsPassed ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={allTestsPassed ? "text-green-700" : "text-red-700"}>
                <strong>
                  {allTestsPassed 
                    ? '✅ Todos os testes ENP passaram - Sistema validado!'
                    : '❌ Alguns testes falharam - Verificar implementação ENP'
                  }
                </strong>
              </AlertDescription>
            </Alert>

            {testResults.map((result, index) => (
              <div key={index} className={`border rounded-lg p-3 ${result.passed ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{result.name}</h4>
                  {result.passed ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                </div>
                
                {result.error ? (
                  <p className="text-sm text-red-600">{result.error}</p>
                ) : (
                  <div className="text-xs space-y-1">
                    <div>TMB: {result.details.tmb.calculated} (esperado: {result.details.tmb.expected}, diff: {result.details.tmb.diff})</div>
                    <div>GET: {result.details.get.calculated} (esperado: {result.details.get.expected}, diff: {result.details.get.diff})</div>
                    <div>Proteína: {result.details.protein.calculated}g (esperado: {result.details.protein.expected}g, diff: {result.details.protein.diff}g)</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
          <strong>Critérios de Validação ENP:</strong> TMB ±5 kcal, GET ±20 kcal, Proteína ±5g.
          Baseado em casos de teste do documento oficial ENP.
        </div>
      </CardContent>
    </Card>
  );
};
