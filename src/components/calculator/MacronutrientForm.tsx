
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Info, Calculator, Save } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import {
  MacronutrientInputs,
  MacronutrientResult,
  calcularMacronutrientes,
  validarInputsMacronutrientes,
  salvarPlanoNutricionalDiario
} from '@/utils/nutrition/macronutrientCalculations';

interface MacronutrientFormProps {
  vetKcal: number;
  peso: number;
  userId: string;
  patientId?: string;
  calculationId?: string;
  onSave?: (result: MacronutrientResult) => void;
}

export const MacronutrientForm: React.FC<MacronutrientFormProps> = ({
  vetKcal,
  peso,
  userId,
  patientId,
  calculationId,
  onSave
}) => {
  const { toast } = useToast();
  const [inputs, setInputs] = useState<MacronutrientInputs>({
    vetKcal,
    peso,
    proteinaTipoDefinicao: 'g_kg',
    proteinaValor: 1.2,
    lipidioTipoDefinicao: 'g_kg',
    lipidioValor: 1.0
  });
  
  const [isSaving, setIsSaving] = useState(false);

  // Calcular macronutrientes em tempo real
  const result = useMemo(() => {
    const validation = validarInputsMacronutrientes(inputs);
    if (!validation.isValid) return null;
    
    return calcularMacronutrientes(inputs);
  }, [inputs]);

  const handleInputChange = (field: keyof MacronutrientInputs, value: any) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!result) {
      toast({
        title: "Erro",
        description: "Corrija os valores antes de salvar",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const plano = {
        calculationId,
        userId,
        patientId,
        vetKcal: result.vetKcal,
        ptnTipoDefinicao: inputs.proteinaTipoDefinicao,
        ptnValor: inputs.proteinaValor,
        ptnGDia: result.proteinaGDia,
        ptnKcal: result.proteinaKcal,
        ptnPercentual: result.proteinaPercentual,
        lipTipoDefinicao: inputs.lipidioTipoDefinicao,
        lipValor: inputs.lipidioValor,
        lipGDia: result.lipidioGDia,
        lipKcal: result.lipidioKcal,
        lipPercentual: result.lipidioPercentual,
        choGDia: result.carboidratoGDia,
        choKcal: result.carboidratoKcal,
        choPercentual: result.carboidratoPercentual
      };

      const saveResult = await salvarPlanoNutricionalDiario(plano);
      
      if (saveResult.success) {
        toast({
          title: "Sucesso",
          description: "Macronutrientes salvos com sucesso!",
        });
        onSave?.(result);
      } else {
        throw new Error(saveResult.error);
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar macronutrientes",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const validation = validarInputsMacronutrientes(inputs);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calculator className="h-5 w-5 mr-2" />
          Definição de Macronutrientes
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 ml-2 text-blue-500" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  Configure proteína e lipídio. O carboidrato será calculado automaticamente por diferença.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Informações Base */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-2">Valores Base</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">VET:</span>
              <span className="font-semibold ml-2">{vetKcal} kcal</span>
            </div>
            <div>
              <span className="text-gray-600">Peso:</span>
              <span className="font-semibold ml-2">{peso} kg</span>
            </div>
          </div>
        </div>

        {/* Proteína */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Proteína</Label>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="protein-type">Tipo</Label>
              <Select 
                value={inputs.proteinaTipoDefinicao} 
                onValueChange={(value: 'g_kg' | 'g_dia') => handleInputChange('proteinaTipoDefinicao', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="g_kg">g/kg</SelectItem>
                  <SelectItem value="g_dia">g/dia</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="protein-value">
                Valor ({inputs.proteinaTipoDefinicao === 'g_kg' ? 'g/kg' : 'g/dia'})
              </Label>
              <Input
                id="protein-value"
                type="number"
                step="0.1"
                value={inputs.proteinaValor}
                onChange={(e) => handleInputChange('proteinaValor', parseFloat(e.target.value) || 0)}
                placeholder="Ex: 1.2"
              />
            </div>
            <div className="flex items-end">
              {result && (
                <div className="text-sm">
                  <div className="text-gray-600">Resultado:</div>
                  <div className="font-semibold">{result.proteinaGDia}g/dia</div>
                  <div className="text-xs text-gray-500">{result.proteinaKcal} kcal</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lipídio */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Lipídio</Label>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="lipid-type">Tipo</Label>
              <Select 
                value={inputs.lipidioTipoDefinicao} 
                onValueChange={(value: 'g_kg' | 'g_dia') => handleInputChange('lipidioTipoDefinicao', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="g_kg">g/kg</SelectItem>
                  <SelectItem value="g_dia">g/dia</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="lipid-value">
                Valor ({inputs.lipidioTipoDefinicao === 'g_kg' ? 'g/kg' : 'g/dia'})
              </Label>
              <Input
                id="lipid-value"
                type="number"
                step="0.1"
                value={inputs.lipidioValor}
                onChange={(e) => handleInputChange('lipidioValor', parseFloat(e.target.value) || 0)}
                placeholder="Ex: 1.0"
              />
            </div>
            <div className="flex items-end">
              {result && (
                <div className="text-sm">
                  <div className="text-gray-600">Resultado:</div>
                  <div className="font-semibold">{result.lipidioGDia}g/dia</div>
                  <div className="text-xs text-gray-500">{result.lipidioKcal} kcal</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Carboidrato (calculado) */}
        {result && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Carboidrato (Calculado por Diferença)</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Gramas/dia:</span>
                <span className="font-semibold ml-2">{result.carboidratoGDia}g</span>
              </div>
              <div>
                <span className="text-gray-600">Calorias:</span>
                <span className="font-semibold ml-2">{result.carboidratoKcal} kcal</span>
              </div>
              <div>
                <span className="text-gray-600">Percentual:</span>
                <span className="font-semibold ml-2">{result.carboidratoPercentual}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Resumo Final */}
        {result && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">Resumo dos Macronutrientes</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <Badge variant="outline" className="mb-2">Proteína</Badge>
                <div className="text-lg font-bold text-blue-600">{result.proteinaPercentual}%</div>
                <div className="text-sm text-gray-600">{result.proteinaGDia}g • {result.proteinaKcal} kcal</div>
              </div>
              <div>
                <Badge variant="outline" className="mb-2">Carboidrato</Badge>
                <div className="text-lg font-bold text-green-600">{result.carboidratoPercentual}%</div>
                <div className="text-sm text-gray-600">{result.carboidratoGDia}g • {result.carboidratoKcal} kcal</div>
              </div>
              <div>
                <Badge variant="outline" className="mb-2">Lipídio</Badge>
                <div className="text-lg font-bold text-orange-600">{result.lipidioPercentual}%</div>
                <div className="text-sm text-gray-600">{result.lipidioGDia}g • {result.lipidioKcal} kcal</div>
              </div>
            </div>
          </div>
        )}

        {/* Erros de validação */}
        {!validation.isValid && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-medium text-red-800 mb-2">Corrija os seguintes erros:</h4>
            <ul className="text-sm text-red-700 space-y-1">
              {validation.errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Botão Salvar */}
        <Button
          onClick={handleSave}
          disabled={!validation.isValid || isSaving}
          className="w-full"
          size="lg"
        >
          {isSaving ? (
            <span className="flex items-center">
              <span className="animate-spin h-4 w-4 mr-2 border-2 border-dashed rounded-full border-current"></span>
              Salvando...
            </span>
          ) : (
            <span className="flex items-center">
              <Save className="mr-2 h-4 w-4" />
              Salvar Macronutrientes
            </span>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
