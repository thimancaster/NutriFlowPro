
import React, { useEffect } from 'react';
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MacroDistributionInputsProps } from './types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from 'lucide-react';

const MacroDistributionInputs = ({
  carbsPercentage,
  setCarbsPercentage,
  proteinPercentage,
  setProteinPercentage,
  fatPercentage,
  setFatPercentage,
  bmr,
  tee,
  objective
}: MacroDistributionInputsProps) => {
  
  // Validate that percentages sum to 100%
  useEffect(() => {
    const carbs = parseFloat(carbsPercentage);
    const protein = parseFloat(proteinPercentage);
    const fat = parseFloat(fatPercentage);
    
    const sum = carbs + protein + fat;
    
    // If the sum is not 100%, we can implement auto-adjustment logic here
    if (Math.abs(sum - 100) > 0.1) {
      console.log(`Warning: Macro percentages sum to ${sum}%. Should be 100%.`);
    }
  }, [carbsPercentage, proteinPercentage, fatPercentage]);
  
  const handleCarbsChange = (value: number[]) => {
    setCarbsPercentage(value[0].toString());
    
    // Optional: Auto-adjust other percentages
    const remaining = 100 - value[0];
    const currentProtein = parseFloat(proteinPercentage) || 0;
    const currentFat = parseFloat(fatPercentage) || 0;
    const currentSum = currentProtein + currentFat;
    
    if (currentSum > 0) {
      const ratio = currentProtein / currentSum;
      setProteinPercentage(Math.round(remaining * ratio).toString());
      setFatPercentage(Math.round(remaining * (1 - ratio)).toString());
    }
  };
  
  const handleProteinChange = (value: number[]) => {
    setProteinPercentage(value[0].toString());
    
    // Optional: Auto-adjust fat to maintain 100%
    const currentCarbs = parseFloat(carbsPercentage) || 0;
    const newFat = 100 - currentCarbs - value[0];
    if (newFat >= 0) {
      setFatPercentage(newFat.toString());
    }
  };
  
  const handleFatChange = (value: number[]) => {
    setFatPercentage(value[0].toString());
    
    // Optional: Auto-adjust carbs to maintain 100%
    const currentProtein = parseFloat(proteinPercentage) || 0;
    const newCarbs = 100 - currentProtein - value[0];
    if (newCarbs >= 0) {
      setCarbsPercentage(newCarbs.toString());
    }
  };
  
  const handleCarbsInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0 && parseFloat(value) <= 100)) {
      setCarbsPercentage(value);
    }
  };
  
  const handleProteinInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0 && parseFloat(value) <= 100)) {
      setProteinPercentage(value);
    }
  };
  
  const handleFatInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0 && parseFloat(value) <= 100)) {
      setFatPercentage(value);
    }
  };

  // Calculate total percentage
  const totalPercentage = parseFloat(carbsPercentage || '0') + 
    parseFloat(proteinPercentage || '0') + 
    parseFloat(fatPercentage || '0');
    
  // Preset macro distributions based on objectives
  const applyPreset = (preset: 'balanced' | 'loseWeight' | 'gainMuscle') => {
    switch(preset) {
      case 'balanced':
        setCarbsPercentage('50');
        setProteinPercentage('20');
        setFatPercentage('30');
        break;
      case 'loseWeight':
        setCarbsPercentage('40');
        setProteinPercentage('30');
        setFatPercentage('30');
        break;
      case 'gainMuscle':
        setCarbsPercentage('50');
        setProteinPercentage('25');
        setFatPercentage('25');
        break;
    }
  };
  
  // Get recommended preset based on objective
  const getRecommendedPreset = (): 'balanced' | 'loseWeight' | 'gainMuscle' => {
    if (!objective) return 'balanced';
    
    if (objective === 'emagrecimento') return 'loseWeight';
    if (objective === 'hipertrofia') return 'gainMuscle';
    
    return 'balanced';
  };

  return (
    <div className="space-y-6 bg-white rounded-lg border p-6">
      <div className="flex justify-between items-center">
        <h3 className="font-medium text-lg">Distribuição de Macronutrientes</h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-gray-500" />
            </TooltipTrigger>
            <TooltipContent side="left">
              <p className="max-w-xs">Ajuste os percentuais para distribuir as calorias entre carboidratos, proteínas e gorduras. O total deve ser 100%.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <div className="flex gap-2 flex-wrap">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => applyPreset('balanced')}
          className={getRecommendedPreset() === 'balanced' ? 'border-green-500' : ''}
        >
          Balanceado (50/20/30)
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => applyPreset('loseWeight')}
          className={getRecommendedPreset() === 'loseWeight' ? 'border-green-500' : ''}
        >
          Emagrecimento (40/30/30)
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => applyPreset('gainMuscle')}
          className={getRecommendedPreset() === 'gainMuscle' ? 'border-green-500' : ''}
        >
          Hipertrofia (50/25/25)
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label htmlFor="carbs">Carboidratos ({carbsPercentage}%)</Label>
          <Input
            id="carbs-percentage"
            value={carbsPercentage}
            onChange={handleCarbsInput}
            className="w-16 h-8 text-center"
          />
        </div>
        <Slider
          id="carbs"
          defaultValue={[parseFloat(carbsPercentage) || 55]}
          max={100}
          step={1}
          onValueChange={handleCarbsChange}
          className="w-full"
        />
        {tee && (
          <div className="text-sm text-gray-500 ml-2">
            ~{Math.round((parseFloat(carbsPercentage) / 100) * tee / 4)}g = {Math.round((parseFloat(carbsPercentage) / 100) * tee)} kcal
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label htmlFor="protein">Proteínas ({proteinPercentage}%)</Label>
          <Input
            id="protein-percentage"
            value={proteinPercentage}
            onChange={handleProteinInput}
            className="w-16 h-8 text-center"
          />
        </div>
        <Slider
          id="protein"
          defaultValue={[parseFloat(proteinPercentage) || 20]}
          max={100}
          step={1}
          onValueChange={handleProteinChange}
          className="w-full"
        />
        {tee && (
          <div className="text-sm text-gray-500 ml-2">
            ~{Math.round((parseFloat(proteinPercentage) / 100) * tee / 4)}g = {Math.round((parseFloat(proteinPercentage) / 100) * tee)} kcal
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label htmlFor="fat">Gorduras ({fatPercentage}%)</Label>
          <Input
            id="fat-percentage"
            value={fatPercentage}
            onChange={handleFatInput}
            className="w-16 h-8 text-center"
          />
        </div>
        <Slider
          id="fat"
          defaultValue={[parseFloat(fatPercentage) || 25]}
          max={100}
          step={1}
          onValueChange={handleFatChange}
          className="w-full"
        />
        {tee && (
          <div className="text-sm text-gray-500 ml-2">
            ~{Math.round((parseFloat(fatPercentage) / 100) * tee / 9)}g = {Math.round((parseFloat(fatPercentage) / 100) * tee)} kcal
          </div>
        )}
      </div>

      {/* Display total and warning if not 100% */}
      <div className={`text-sm ${Math.abs(totalPercentage - 100) < 0.1 ? 'text-green-600' : 'text-amber-600'} font-medium`}>
        Total: {totalPercentage.toFixed(0)}% {Math.abs(totalPercentage - 100) >= 0.1 && ' (Deve somar 100%)'}
      </div>
      
      {tee && (
        <div className="p-3 rounded bg-gray-50 text-sm">
          <div className="font-medium mb-1">Totais estimados:</div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <div className="text-gray-500">Carboidratos</div>
              <div className="font-medium">{Math.round((parseFloat(carbsPercentage) / 100) * tee / 4)}g</div>
            </div>
            <div>
              <div className="text-gray-500">Proteínas</div>
              <div className="font-medium">{Math.round((parseFloat(proteinPercentage) / 100) * tee / 4)}g</div>
            </div>
            <div>
              <div className="text-gray-500">Gorduras</div>
              <div className="font-medium">{Math.round((parseFloat(fatPercentage) / 100) * tee / 9)}g</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MacroDistributionInputs;
