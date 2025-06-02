
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export const ENPCalculatorHeader: React.FC = () => {
  return (
    <Alert className="border-blue-200 bg-blue-50">
      <Info className="h-4 w-4 text-blue-600" />
      <AlertDescription className="text-blue-700">
        <strong>Sistema ENP v2.0:</strong> Implementação oficial da Engenharia Nutricional Padrão.
        Harris-Benedict Revisada • Fatores Fixos • Macros Padronizados • Distribuição 6 Refeições.
      </AlertDescription>
    </Alert>
  );
};
