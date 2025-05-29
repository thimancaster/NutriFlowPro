
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Ruler, Info } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface AnthropometricFormProps {
  waist?: number;
  hip?: number;
  sum3Folds?: number;
  onWaistChange: (value: number) => void;
  onHipChange: (value: number) => void;
  onSum3FoldsChange: (value: number) => void;
}

const AnthropometricForm: React.FC<AnthropometricFormProps> = ({
  waist,
  hip,
  sum3Folds,
  onWaistChange,
  onHipChange,
  onSum3FoldsChange
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (value: number) => void
  ) => {
    const value = parseFloat(e.target.value) || 0;
    onChange(value);
  };

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ruler className="h-5 w-5" />
                Medidas Antropométricas Adicionais
              </div>
              <Button variant="ghost" size="sm">
                {isOpen ? 'Ocultar' : 'Expandir'}
              </Button>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Medidas opcionais para cálculos mais precisos:</p>
                  <ul className="text-xs space-y-1">
                    <li>• <strong>Cintura e Quadril:</strong> Para cálculo da RCQ (Relação Cintura-Quadril)</li>
                    <li>• <strong>Dobras Cutâneas:</strong> Para % de gordura corporal pelo método Jackson-Pollock</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="waist">Circunferência da Cintura (cm)</Label>
                <Input
                  id="waist"
                  type="number"
                  step="0.1"
                  placeholder="Ex: 80.5"
                  value={waist || ''}
                  onChange={(e) => handleInputChange(e, onWaistChange)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="hip">Circunferência do Quadril (cm)</Label>
                <Input
                  id="hip"
                  type="number"
                  step="0.1"
                  placeholder="Ex: 95.0"
                  value={hip || ''}
                  onChange={(e) => handleInputChange(e, onHipChange)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sum3Folds">
                Soma das 3 Dobras Cutâneas (mm)
                <span className="text-sm text-gray-500 ml-1">
                  (Tricipital + Subescapular + Suprailíaca)
                </span>
              </Label>
              <Input
                id="sum3Folds"
                type="number"
                step="0.1"
                placeholder="Ex: 45.5"
                value={sum3Folds || ''}
                onChange={(e) => handleInputChange(e, onSum3FoldsChange)}
              />
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="text-sm text-gray-600">
                <strong>Protocolo Jackson-Pollock (3 dobras):</strong>
                <ul className="list-disc list-inside mt-1 space-y-1 text-xs">
                  <li><strong>Homens:</strong> Peitoral, Abdominal, Coxa</li>
                  <li><strong>Mulheres:</strong> Tricipital, Suprailíaca, Coxa</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default AnthropometricForm;
