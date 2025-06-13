
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Info, Calculator } from 'lucide-react';
import { GERFormula, GER_FORMULAS } from '@/types/gerFormulas';
import { recommendGERFormula } from '@/utils/nutrition/gerCalculations';

interface GERFormulaSelectionProps {
  selectedFormula?: GERFormula;
  onFormulaChange: (formula: GERFormula) => void;
  profile?: 'eutrofico' | 'sobrepeso_obesidade' | 'atleta';
  hasBodyFat?: boolean;
  required?: boolean;
}

const GERFormulaSelection: React.FC<GERFormulaSelectionProps> = ({
  selectedFormula,
  onFormulaChange,
  profile,
  hasBodyFat = false,
  required = true
}) => {
  // Recomendar fórmula baseada no perfil
  const recommendedFormula = profile ? recommendGERFormula(profile, hasBodyFat) : null;
  
  return (
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
              <strong>Recomendação:</strong> Com base no perfil selecionado, 
              recomendamos a fórmula <strong>{GER_FORMULAS[recommendedFormula].name}</strong>
            </AlertDescription>
          </Alert>
        )}
        
        <div>
          <Label htmlFor="ger-formula">
            Equação para Gasto Energético de Repouso (GER) {required && <span className="text-red-500">*</span>}
          </Label>
          <Select value={selectedFormula} onValueChange={onFormulaChange}>
            <SelectTrigger id="ger-formula" className="mt-2">
              <SelectValue placeholder="Selecione a equação GER" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(GER_FORMULAS).map((formula) => (
                <SelectItem key={formula.id} value={formula.id}>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{formula.name}</span>
                      {formula.id === recommendedFormula && (
                        <Badge variant="secondary" className="text-xs">Recomendada</Badge>
                      )}
                      {formula.requiresBodyFat && (
                        <Badge variant="outline" className="text-xs">Requer % Gordura</Badge>
                      )}
                    </div>
                    <span className="text-xs text-gray-600">{formula.indication}</span>
                  </div>
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
          <Alert className="border-orange-200 bg-orange-50">
            <Info className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-700">
              Esta fórmula requer o percentual de gordura corporal para maior precisão. 
              Considere adicionar esta informação nos dados antropométricos.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default GERFormulaSelection;
