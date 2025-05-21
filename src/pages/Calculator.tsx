
import React, { useEffect } from 'react';
import { CalculatorTool } from '@/components/calculator';
import { usePatient } from '@/contexts/PatientContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { User, Plus, Database } from 'lucide-react';
import { CalculatorProvider } from '@/contexts/CalculatorContext';
import PatientBanner from '@/components/patient/PatientBanner';
import ContextualNavigation from '@/components/patient/ContextualNavigation';
import { usePatientDetail } from '@/hooks/patient/usePatientDetail';

const CalculatorPage = () => {
  const { activePatient, loadPatientById } = usePatient();
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get('patientId');
  const navigate = useNavigate();
  const { openPatientDetail } = usePatientDetail();

  // Load patient if patientId is provided in URL but not active yet
  useEffect(() => {
    if (patientId && (!activePatient || activePatient.id !== patientId)) {
      loadPatientById(patientId);
    }
  }, [patientId, activePatient, loadPatientById]);

  const handleViewPatientProfile = () => {
    if (activePatient) {
      // First try to open the patient detail modal
      openPatientDetail(activePatient);
      
      // Alternatively, navigate to the patient profile page
      // navigate(`/patients/${activePatient.id}`);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <ContextualNavigation currentModule="calculator" />
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Calculadora Nutricional</h1>
          <p className="text-gray-500">Calcule as necessidades energéticas e macronutrientes</p>
        </div>
        
        <div className="flex space-x-2">
          {!activePatient && (
            <Link to="/patients">
              <Button variant="outline" className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>Selecionar Paciente</span>
              </Button>
            </Link>
          )}
          
          {activePatient && (
            <Button 
              variant="outline" 
              className="flex items-center gap-1"
              onClick={handleViewPatientProfile}
            >
              <User className="h-4 w-4" />
              <span>Ver Perfil</span>
            </Button>
          )}
          
          <Link to="/food-database">
            <Button variant="outline" className="flex items-center gap-1">
              <Database className="h-4 w-4" />
              <span>Base de Alimentos</span>
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Display patient banner if patient is selected */}
      {activePatient && <PatientBanner />}
      
      {!activePatient && (
        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <AlertDescription>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
              <div>
                <span className="font-medium">Dica:</span> Selecione um paciente para preencher automaticamente os dados ou cadastre um novo paciente.
              </div>
              <Link to="/patients/new">
                <Button size="sm" className="bg-nutri-green hover:bg-nutri-green-dark flex items-center gap-1">
                  <Plus className="h-4 w-4" />
                  Novo Paciente
                </Button>
              </Link>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Instruções</CardTitle>
          <CardDescription>Como utilizar a calculadora nutricional</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal ml-5 space-y-2">
            <li>Preencha os dados do paciente (peso, altura, idade, sexo e nível de atividade)</li>
            <li>Selecione o objetivo do paciente (emagrecimento, manutenção ou hipertrofia)</li>
            <li>Ajuste a distribuição de macronutrientes conforme necessário</li>
            <li>Clique em "Calcular" para obter os resultados</li>
            <li>Salve o paciente ou gere o plano alimentar a partir dos resultados</li>
          </ol>
        </CardContent>
      </Card>
      
      <CalculatorProvider>
        <CalculatorTool patientData={activePatient} onViewProfile={handleViewPatientProfile} />
      </CalculatorProvider>
    </div>
  );
};

export default CalculatorPage;
