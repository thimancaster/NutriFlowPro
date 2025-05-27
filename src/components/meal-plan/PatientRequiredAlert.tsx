
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PatientRequiredAlert: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>
            É necessário selecionar um paciente antes de gerar um plano alimentar.
          </span>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/patients')}
          >
            <User className="h-4 w-4 mr-2" />
            Selecionar Paciente
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default PatientRequiredAlert;
