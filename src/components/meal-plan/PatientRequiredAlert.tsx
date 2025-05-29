
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users } from 'lucide-react';

const PatientRequiredAlert: React.FC = () => {
  return (
    <Card>
      <CardContent className="p-6">
        <Alert>
          <Users className="h-4 w-4" />
          <AlertDescription>
            É necessário selecionar um paciente para gerar um plano alimentar.
            Por favor, volte à lista de pacientes e selecione um paciente primeiro.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default PatientRequiredAlert;
