
import React from 'react';
import { Button } from '@/components/ui/button';

interface PatientErrorStateProps {
  errorMessage: string;
  onRetry: () => void;
}

const PatientErrorState = ({ errorMessage, onRetry }: PatientErrorStateProps) => {
  return (
    <div className="text-center py-8">
      <p className="text-red-500">Erro ao carregar pacientes: {errorMessage}</p>
      <Button 
        onClick={onRetry}
        className="mt-4"
      >
        Tentar novamente
      </Button>
    </div>
  );
};

export default PatientErrorState;
