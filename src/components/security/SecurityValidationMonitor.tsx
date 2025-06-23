
import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { validateNutritionalConstants } from '@/utils/validation/nutritionalConstants';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { Badge } from '@/components/ui/badge';

export const SecurityValidationMonitor: React.FC = () => {
  const [validationResults, setValidationResults] = useState<any>(null);

  useEffect(() => {
    const runValidation = () => {
      const results = validateNutritionalConstants();
      setValidationResults(results);
    };

    runValidation();
    // Run validation every 5 minutes
    const interval = setInterval(runValidation, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  if (!validationResults) return null;

  return (
    <AnimatedCard className="border-l-4 border-l-nutri-green">
      <div className="flex items-center gap-3 mb-3">
        {validationResults.isValid ? (
          <CheckCircle className="h-5 w-5 text-green-500" />
        ) : (
          <XCircle className="h-5 w-5 text-red-500" />
        )}
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
          Validação de Constantes Nutricionais
        </h3>
        <Badge variant={validationResults.isValid ? "default" : "destructive"}>
          {validationResults.isValid ? 'Válido' : 'Atenção'}
        </Badge>
      </div>

      {validationResults.errors?.length > 0 && (
        <div className="mb-3">
          <h4 className="text-sm font-medium text-red-600 mb-2 flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Erros Críticos
          </h4>
          <ul className="text-sm text-red-600 space-y-1">
            {validationResults.errors.map((error: string, index: number) => (
              <li key={index} className="flex items-start gap-2">
                <span className="w-1 h-1 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {validationResults.warnings?.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-yellow-600 mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Avisos
          </h4>
          <ul className="text-sm text-yellow-600 space-y-1">
            {validationResults.warnings.map((warning: string, index: number) => (
              <li key={index} className="flex items-start gap-2">
                <span className="w-1 h-1 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                {warning}
              </li>
            ))}
          </ul>
        </div>
      )}

      {validationResults.isValid && (
        <p className="text-sm text-green-600">
          Todas as constantes nutricionais estão dentro dos padrões científicos aceitos.
        </p>
      )}
    </AnimatedCard>
  );
};
