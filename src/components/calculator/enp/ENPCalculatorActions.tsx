
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calculator } from 'lucide-react';

interface ENPCalculatorActionsProps {
  onCalculate: () => Promise<void>;
  isValid: boolean;
  isCalculating: boolean;
  error: string | null;
}

export const ENPCalculatorActions: React.FC<ENPCalculatorActionsProps> = ({
  onCalculate,
  isValid,
  isCalculating,
  error
}) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <Button
          onClick={onCalculate}
          disabled={!isValid || isCalculating}
          className="w-full"
          size="lg"
        >
          {isCalculating ? (
            <span className="flex items-center">
              <span className="animate-spin h-4 w-4 mr-2 border-2 border-dashed rounded-full border-current"></span>
              Calculando com ENP...
            </span>
          ) : (
            <span className="flex items-center">
              <Calculator className="mr-2 h-4 w-4" />
              Calcular com ENP v2.0
            </span>
          )}
        </Button>
        
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
