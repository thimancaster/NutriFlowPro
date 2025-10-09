import React from "react";
import { useAuth } from "@/contexts/auth/AuthContext";
import { usePatient } from "@/contexts/patient/PatientContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Calculator } from "lucide-react";
import { useOfficialCalculations } from "@/hooks/useOfficialCalculations";

const CalculatorTool: React.FC = () => {
  const { user } = useAuth();
  const { activePatient } = usePatient();
  const { results } = useOfficialCalculations();

  const handleExportResults = () => {
    if (!results) return;

    const exportData = {
      system: "NutriFlow Pro - Motor Oficial de Cálculos",
      timestamp: new Date().toISOString(),
      patient: activePatient
        ? {
            id: activePatient.id,
            name: activePatient.name,
          }
        : null,
      professional: user?.email,
      results: {
        tmb: results.tmb.value,
        formula: results.tmb.formula,
        get: results.get,
        vet: results.vet,
        macros: results.macros
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `calculo-${activePatient?.name || "paciente"}-${
      new Date().toISOString().split("T")[0]
    }.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl text-primary">
            <Calculator className="h-8 w-8 mr-3" />
            Calculadora Nutricional Oficial
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-primary/20 bg-primary/5">
            <Info className="h-4 w-4 text-primary" />
            <AlertDescription className="text-primary/90">
              <strong>Motor Oficial:</strong> Utiliza fórmulas cientificamente validadas
              (Harris-Benedict, Mifflin-St Jeor, Tinsley) com fatores de atividade
              padronizados e cálculo de macronutrientes por g/kg.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Status do Sistema */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-green-500/20 bg-green-500/5">
          <CardContent className="pt-4">
            <div className="text-sm text-green-700 dark:text-green-400">
              <strong>✅ TMB:</strong> 3 Fórmulas Disponíveis
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-500/20 bg-green-500/5">
          <CardContent className="pt-4">
            <div className="text-sm text-green-700 dark:text-green-400">
              <strong>✅ Fatores:</strong> Científicos Validados
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-500/20 bg-green-500/5">
          <CardContent className="pt-4">
            <div className="text-sm text-green-700 dark:text-green-400">
              <strong>✅ Macros:</strong> Personalizado por g/kg
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mensagem Temporária */}
      <Card>
        <CardContent className="pt-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              A interface da calculadora será implementada na próxima fase. 
              O motor de cálculo oficial já está configurado e funcionando corretamente.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Export Button */}
      {results && (
        <div className="flex justify-end">
          <button
            onClick={handleExportResults}
            className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 transition-colors">
            Exportar Resultados
          </button>
        </div>
      )}
    </div>
  );
};

export default CalculatorTool;
