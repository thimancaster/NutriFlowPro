
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, Calculator, AlertTriangle } from 'lucide-react';
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
  
  // Calcular IMC para validações adicionais
  const imc = weight && height ? weight / Math.pow(height / 100, 2) : null;
  
  // Verificar se a fórmula selecionada tem algum problema
  const getFormulaWarnings = (formula: GERFormula): string[] => {
    const warnings: string[] = [];
    const formulaInfo = GER_FORMULAS[formula];
    
    if (formulaInfo.requiresBodyFat && !hasBodyFat) {
      warnings.push(`Requer percentual de gordura corporal para máxima precisão`);
    }
    
    if (imc) {
      switch (formula) {
        case 'harris_benedict_revisada':
          if (imc > 30) warnings.push('Pode superestimar o gasto em pacientes obesos');
          break;
        case 'mifflin_st_jeor':
          if (age && (age < 18 || age > 65)) warnings.push('Menos precisa fora da faixa etária de 18-65 anos');
          break;
        case 'owen':
          if (imc < 25) warnings.push('Mais indicada para pacientes com sobrepeso/obesidade');
          break;
        case 'cunningham':
          if (profile !== 'atleta') warnings.push('Desenvolvida especificamente para atletas de elite');
          break;
      }
    }
    
    return warnings;
  };

  const selectedFormulaWarnings = selectedFormula ? getFormulaWarnings(selectedFormula) : [];

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
                {imc && imc > 30 && recommendedFormula === 'owen' && (
                  <span className="block mt-1 text-sm">
                    (Recomendada devido ao IMC elevado: {imc.toFixed(1)} kg/m²)
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}
          
          <div>
            <Label htmlFor="ger-formula">
              Equação para Gasto Energético de Repouso (GER) {required && <span className="text-red-500">*</span>}
            </Label>
            <Select 
              value={selectedFormula} 
              onValueChange={(value) => onFormulaChange(value as GERFormula)}
            >
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
              <div className="mt-2 space-y-2">
                <p className="text-xs text-gray-600">
                  {GER_FORMULAS[selectedFormula].description}
                </p>
                
                {selectedFormulaWarnings.length > 0 && (
                  <Alert className="border-amber-200 bg-amber-50">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-700">
                      <div className="font-medium mb-1">Atenção:</div>
                      <ul className="text-sm space-y-1">
                        {selectedFormulaWarnings.map((warning, index) => (
                          <li key={index}>• {warning}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </div>
          
          {/* Informações adicionais sobre precisão */}
          {selectedFormula && age && weight && height && (
            <div className="bg-gray-50 p-3 rounded-md border text-sm">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-4 w-4 text-gray-600" />
                <span className="font-medium text-gray-700">Informações do Paciente</span>
              </div>
              <div className="text-gray-600 space-y-1">
                <div>IMC: {imc ? `${imc.toFixed(1)} kg/m²` : 'Não calculado'}</div>
                <div>Idade: {age} anos</div>
                {hasBodyFat && <div>% Gordura: Informado</div>}
                <div className="mt-2 text-xs">
                  Fórmula selecionada: <strong>{GER_FORMULAS[selectedFormula].name}</strong>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default GERFormulaSelection;
