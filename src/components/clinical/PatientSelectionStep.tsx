
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

interface PatientSelectionStepProps {
  initialPatientId?: string;
  onNext: () => void;
  onPrev: () => void;
}

const PatientSelectionStep: React.FC<PatientSelectionStepProps> = ({ 
  initialPatientId, 
  onNext, 
  onPrev 
}) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Seleção de Paciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Componente de seleção de paciente em desenvolvimento...</p>
          {initialPatientId && (
            <p className="text-sm text-gray-500 mt-2">
              Paciente inicial: {initialPatientId}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev} disabled>
          Anterior
        </Button>
        <Button onClick={onNext}>
          Próximo
        </Button>
      </div>
    </div>
  );
};

export default PatientSelectionStep;
