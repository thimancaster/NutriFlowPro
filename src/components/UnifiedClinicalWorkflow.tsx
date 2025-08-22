
import React from 'react';

interface UnifiedClinicalWorkflowProps {
  onComplete?: () => void;
}

const UnifiedClinicalWorkflow: React.FC<UnifiedClinicalWorkflowProps> = ({ onComplete }) => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Fluxo Clínico Unificado</h1>
      <p>Implementação do fluxo clínico em desenvolvimento...</p>
      {onComplete && (
        <button onClick={onComplete} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
          Concluir
        </button>
      )}
    </div>
  );
};

export default UnifiedClinicalWorkflow;
