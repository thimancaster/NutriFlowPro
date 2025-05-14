
import React from 'react';
import { Loader2 } from 'lucide-react';

const PatientLoadingState = () => {
  return (
    <div className="text-center py-8">
      <Loader2 className="inline-block animate-spin rounded-full h-8 w-8 text-nutri-blue" />
      <p className="mt-2 text-gray-600">Carregando pacientes...</p>
    </div>
  );
};

export default PatientLoadingState;
