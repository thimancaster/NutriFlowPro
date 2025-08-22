
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Target } from 'lucide-react';
import { ConsultationData } from '@/types';
import { usePatient } from '@/contexts/patient/PatientContext';

export interface WorkflowHeaderProps {
  consultationData?: ConsultationData;
}

const WorkflowHeader: React.FC<WorkflowHeaderProps> = ({ consultationData }) => {
  const { activePatient } = usePatient();

  if (!activePatient) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          {activePatient.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {new Date().toLocaleDateString('pt-BR')}
            </span>
          </div>
          {consultationData?.objective && (
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-gray-500" />
              <Badge variant="secondary">
                {consultationData.objective}
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkflowHeader;
