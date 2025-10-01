
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePatient } from '@/contexts/patient/PatientContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

const MealPlanGenerator: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { activePatient } = usePatient();
  const { toast } = useToast();

  // Verificar se viemos da calculadora ENP
  const calculationData = location.state?.calculationData;
  const patientData = location.state?.patientData;
  const systemType = location.state?.systemType;


  useEffect(() => {
    if (calculationData && patientData) {
      toast({
        title: "Dados ENP carregados",
        description: `Plano alimentar baseado em ${calculationData.tdee} kcal diárias`,
      });
    }
  }, [calculationData, patientData, toast]);

  if (!activePatient || !calculationData) {
    return (
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Gerador de Plano Alimentar</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="border-blue-200 bg-blue-50">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-700">
                Para gerar um plano alimentar, você precisa primeiro realizar um cálculo nutricional
                e selecionar um paciente.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Gerador de Plano Alimentar</CardTitle>
        </CardHeader>
        <CardContent>
          {systemType === 'ENP' && (
            <Alert className="border-green-200 bg-green-50 mb-4">
              <Info className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                <strong>Plano ENP:</strong> Este plano alimentar está sendo gerado usando os resultados 
                da Engenharia Nutricional Padrão.
              </AlertDescription>
            </Alert>
          )}
          <div className="space-y-4">
            <p>Paciente: {activePatient.name}</p>
            <p>Calorias totais: {calculationData.tdee} kcal</p>
            <p>Proteínas: {calculationData.protein}g</p>
            <p>Carboidratos: {calculationData.carbs}g</p>
            <p>Gorduras: {calculationData.fats}g</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MealPlanGenerator;
