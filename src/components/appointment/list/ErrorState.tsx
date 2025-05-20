
import React, { memo } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCcw } from 'lucide-react';

interface ErrorStateProps {
  error: Error;
  onRetry: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Erro</AlertTitle>
    <AlertDescription>
      {error.message}
      <Button variant="link" className="mt-2 p-0" onClick={onRetry}>
        <RefreshCcw className="mr-1 h-3 w-3" /> Tentar novamente
      </Button>
    </AlertDescription>
  </Alert>
);

export default memo(ErrorState);
