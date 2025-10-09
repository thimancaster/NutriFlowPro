import React, { useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useConsultationData } from '@/contexts/ConsultationDataContext';
import { usePatient } from '@/contexts/patient/PatientContext';
import { Calculator, History, User } from 'lucide-react';
import { OfficialCalculatorForm } from '@/components/calculator/OfficialCalculatorForm';

interface AnthropometryStepProps {
  onCalculationsComplete?: () => void;
}

const AnthropometryStep: React.FC<AnthropometryStepProps> = ({ onCalculationsComplete }) => {
  const { 
    consultationData, 
    updateConsultationData, 
    patientHistoryData 
  } = useConsultationData();
  
  const { activePatient } = usePatient();

  // Handle calculation completion
  const handleCalculationComplete = (results: any) => {
    console.log('[ANTHRO] Calculation completed:', results);
    
    // Update consultation data with results
    updateConsultationData({
      bmr: results.tmb.value,
      results: {
        bmr: results.tmb.value,
        get: results.get,
        vet: results.vet,
        adjustment: results.vet - results.get,
        macros: {
          protein: results.macros.protein.grams,
          carbs: results.macros.carbs.grams,
          fat: results.macros.fat.grams
        }
      }
    });

    // Notify parent that calculations are complete
    onCalculationsComplete?.();
  };

  // Prepare initial data from patient and consultation context
  const initialData = {
    weight: consultationData?.weight || activePatient?.weight,
    height: consultationData?.height || activePatient?.height,
    age: consultationData?.age || activePatient?.age,
    gender: (consultationData?.gender || activePatient?.gender) as 'M' | 'F'
  };

  // Get last measurement safely
  const lastMeasurement = patientHistoryData?.lastMeasurement;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              Avaliação Nutricional
            </CardTitle>
            <Badge variant="default" className="bg-green-600">
              Motor Oficial
            </Badge>
          </div>
          
          {activePatient && (
            <div className="mt-2 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-blue-700 mb-1">
                <User className="h-4 w-4" />
                Paciente: {activePatient.name}
              </div>
              {activePatient.age && (
                <div className="text-sm text-muted-foreground">
                  Idade: {activePatient.age} anos | Sexo: {activePatient.gender === 'male' ? 'Masculino' : 'Feminino'}
                </div>
              )}
            </div>
          )}

          {lastMeasurement && (
            <div className="mt-2 p-3 bg-primary/5 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-primary mb-1">
                <History className="h-4 w-4" />
                Última medição ({new Date(lastMeasurement.date).toLocaleDateString('pt-BR')})
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div>Peso: {lastMeasurement.weight}kg</div>
                <div>Altura: {lastMeasurement.height}cm</div>
              </div>
            </div>
          )}
        </CardHeader>
        
        <CardContent>
          <OfficialCalculatorForm 
            initialData={initialData}
            onCalculationComplete={handleCalculationComplete}
          />
        </CardContent>
      </Card>

      {/* Show history if available */}
      {patientHistoryData?.anthropometryHistory && patientHistoryData.anthropometryHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Histórico Antropométrico</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {patientHistoryData.anthropometryHistory.slice(0, 5).map((record, index) => (
                <div key={index} className="flex justify-between items-center text-sm p-2 rounded hover:bg-accent">
                  <span className="text-muted-foreground">
                    {new Date(record.date).toLocaleDateString('pt-BR')}
                  </span>
                  <span className="font-medium">
                    {record.weight}kg | {record.height}cm | IMC: {record.bmi.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnthropometryStep;
