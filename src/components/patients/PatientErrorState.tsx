
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface PatientErrorStateProps {
  errorMessage: string;
  onRetry: () => void;
}

const PatientErrorState: React.FC<PatientErrorStateProps> = ({ errorMessage, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="rounded-full bg-red-100 p-3 mb-4">
        <AlertCircle className="h-8 w-8 text-red-600" />
      </div>
      <h3 className="text-lg font-medium mb-2">Erro ao carregar pacientes</h3>
      <p className="text-sm text-gray-500 text-center mb-4">{errorMessage}</p>
      <Button onClick={onRetry} variant="outline">
        Tentar novamente
      </Button>
    </div>
  );
};

export default PatientErrorState;
