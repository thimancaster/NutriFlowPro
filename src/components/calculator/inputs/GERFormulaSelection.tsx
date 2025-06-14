
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, Calculator } from 'lucide-react';
import { GERFormula, GER_FORMULAS } from '@/types/gerFormulas';
import { recommendGERFormula } from '@/utils/nutrition/gerCalculations';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { FormulaSelectItem } from './FormulaSelectItem';
import { Profile } from '@/types/consultation';

interface GERFormulaSelectionProps {
  selectedFormula: GERFormula | undefined;
  onFormulaChange: (value: GERFormula) => void;
  profile: Profile;
  hasBodyFat: boolean;
  age?: number;
  weight?: number;
  height?: number;
  required?: boolean;
}

const GERFormulaSelection: React.FC<GERFormulaSelectionProps> = ({
  selectedFormula,
  onFormulaChange,
  profile,
  hasBodyFat,
  age,
  weight,
  height,
  required = true,
}) => {
  const recommendedFormula = profile ? recommendGERFormula(profile, hasBodyFat, age, weight, height) : null;

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Seleção da Equação GER
            {required && <span className="text-red-500">*</span>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {recommendedFormula && (
            <Alert className="border-blue-200 bg-blue-50">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-700">
                <strong>Recomendação:</strong> Com base nos dados informados, 
                sugerimos a fórmula <strong>{GER_FORMULAS[recommendedFormula].name}</strong>.
              </AlertDescription>
            </Alert>
          )}
          
          <div>
            <Label htmlFor="ger-formula">
              Equação para Gasto Energético de Repouso (GER) {required && <span className="text-red-500">*</span>}
            </Label>
            <Select value={selectedFormula} onValueChange={(value) => onFormulaChange(value as GERFormula)}>
              <SelectTrigger id="ger-formula" className="mt-2">
                <SelectValue placeholder="Selecione a equação GER" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(GER_FORMULAS).map((formula) => (
                  <SelectItem key={formula.id} value={formula.id}>
                    <FormulaSelectItem 
                      formula={formula} 
                      isRecommended={formula.id === recommendedFormula} 
                    />
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedFormula && (
              <p className="text-xs text-gray-600 mt-2">
                {GER_FORMULAS[selectedFormula].description}
              </p>
            )}
          </div>
          
          {selectedFormula && GER_FORMULAS[selectedFormula].requiresBodyFat && !hasBodyFat && (
            <Alert className="border-amber-200 bg-amber-50">
              <Info className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-700">
                A fórmula <strong>{GER_FORMULAS[selectedFormula].name}</strong> requer o percentual de gordura corporal. 
                Os resultados podem ser imprecisos sem esta informação.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default GERFormulaSelection;
