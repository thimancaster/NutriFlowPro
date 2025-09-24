/**
 * MANUAL MACRO INPUT COMPONENT
 * Allows users to manually input protein and fat g/kg as per official specification
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Info, Calculator } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export interface MacroInputs {
  proteinPerKg: number;
  fatPerKg: number;
}

interface MacroInputFormProps {
  inputs: MacroInputs;
  weight: number;
  onInputsChange: (inputs: MacroInputs) => void;
  onCalculate?: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export const MacroInputForm: React.FC<MacroInputFormProps> = ({
  inputs,
  weight,
  onInputsChange,
  onCalculate,
  loading = false,
  disabled = false
}) => {
  const handleProteinChange = (value: string) => {
    const proteinPerKg = parseFloat(value) || 0;
    onInputsChange({ ...inputs, proteinPerKg });
  };

  const handleFatChange = (value: string) => {
    const fatPerKg = parseFloat(value) || 0;
    onInputsChange({ ...inputs, fatPerKg });
  };

  // Calculate preview values
  const proteinGrams = Math.round(inputs.proteinPerKg * weight * 10) / 10;
  const proteinKcal = Math.round(proteinGrams * 4);
  const fatGrams = Math.round(inputs.fatPerKg * weight * 10) / 10;
  const fatKcal = Math.round(fatGrams * 9);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Distribuição de Macronutrientes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Conforme especificação oficial: insira manualmente a proteína e gordura por kg.
            Os carboidratos serão calculados automaticamente pela diferença energética.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Protein Input */}
          <div className="space-y-2">
            <Label htmlFor="protein-input">
              Proteína (g/kg)
              <span className="text-muted-foreground ml-1">*</span>
            </Label>
            <Input
              id="protein-input"
              type="number"
              step="0.1"
              min="0.5"
              max="5.0"
              value={inputs.proteinPerKg}
              onChange={(e) => handleProteinChange(e.target.value)}
              disabled={disabled || loading}
              placeholder="Ex: 1.8"
            />
            <div className="text-sm text-muted-foreground">
              {weight > 0 && (
                <span>
                  = {proteinGrams}g ({proteinKcal} kcal)
                </span>
              )}
            </div>
          </div>

          {/* Fat Input */}
          <div className="space-y-2">
            <Label htmlFor="fat-input">
              Gordura (g/kg)
              <span className="text-muted-foreground ml-1">*</span>
            </Label>
            <Input
              id="fat-input"
              type="number"
              step="0.1"
              min="0.3"
              max="3.0"
              value={inputs.fatPerKg}
              onChange={(e) => handleFatChange(e.target.value)}
              disabled={disabled || loading}
              placeholder="Ex: 1.0"
            />
            <div className="text-sm text-muted-foreground">
              {weight > 0 && (
                <span>
                  = {fatGrams}g ({fatKcal} kcal)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Carbohydrate Preview */}
        <div className="bg-muted/30 p-3 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-medium">Carboidratos (automático)</span>
            <span className="text-sm text-muted-foreground">
              Calculado pela diferença energética
            </span>
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            Total - Proteína - Gordura = Carboidratos
          </div>
        </div>

        {/* Validation Messages */}
        {inputs.proteinPerKg > 0 && inputs.proteinPerKg < 0.8 && (
          <Alert variant="destructive">
            <AlertDescription>
              Proteína muito baixa. Recomenda-se pelo menos 0.8g/kg para adultos saudáveis.
            </AlertDescription>
          </Alert>
        )}

        {inputs.proteinPerKg > 3.5 && (
          <Alert variant="destructive">
            <AlertDescription>
              Proteína muito alta. Valores acima de 3.5g/kg podem ser desnecessários.
            </AlertDescription>
          </Alert>
        )}

        {inputs.fatPerKg > 0 && inputs.fatPerKg < 0.5 && (
          <Alert variant="destructive">
            <AlertDescription>
              Gordura muito baixa. Recomenda-se pelo menos 0.5g/kg para funções essenciais.
            </AlertDescription>
          </Alert>
        )}

        {/* Calculate Button */}
        {onCalculate && (
          <Button 
            onClick={onCalculate}
            disabled={disabled || loading || inputs.proteinPerKg <= 0 || inputs.fatPerKg <= 0}
            className="w-full"
          >
            {loading ? 'Calculando...' : 'Calcular Macronutrientes'}
          </Button>
        )}

        {/* Recommended Values */}
        <div className="border-t pt-4 space-y-2">
          <h4 className="font-medium text-sm">Valores Recomendados:</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
            <div className="bg-primary/5 p-2 rounded">
              <div className="font-medium">Eutrófico</div>
              <div>Proteína: 1.6-2.0 g/kg</div>
              <div>Gordura: 0.8-1.2 g/kg</div>
            </div>
            <div className="bg-orange-50 p-2 rounded">
              <div className="font-medium">Sobrepeso</div>
              <div>Proteína: 2.0-2.4 g/kg</div>
              <div>Gordura: 0.5-0.8 g/kg</div>
            </div>
            <div className="bg-green-50 p-2 rounded">
              <div className="font-medium">Atleta</div>
              <div>Proteína: 2.0-2.8 g/kg</div>
              <div>Gordura: 1.0-1.5 g/kg</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};