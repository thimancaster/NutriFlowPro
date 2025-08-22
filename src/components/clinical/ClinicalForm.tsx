
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConsultationData } from '@/types';

interface ClinicalFormProps {
  patientId: string;
  initialConsultationData?: ConsultationData;
  onConsultationUpdate?: (data: Partial<ConsultationData>) => void;
  onConsultationComplete?: (data: ConsultationData) => void;
}

const ClinicalForm: React.FC<ClinicalFormProps> = ({
  patientId,
  initialConsultationData,
  onConsultationUpdate,
  onConsultationComplete
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Avaliação Clínica</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">
          Componente de avaliação clínica em desenvolvimento.
        </p>
      </CardContent>
    </Card>
  );
};

export default ClinicalForm;
