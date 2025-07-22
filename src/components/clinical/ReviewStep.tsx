
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

interface ReviewStepProps {
  onNext: () => void;
  onPrev: () => void;
}

const ReviewStep: React.FC<ReviewStepProps> = ({ onNext, onPrev }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Revisão Final
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Revisão da consulta em desenvolvimento...</p>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev}>
          Anterior
        </Button>
        <Button onClick={onNext}>
          Finalizar
        </Button>
      </div>
    </div>
  );
};

export default ReviewStep;
