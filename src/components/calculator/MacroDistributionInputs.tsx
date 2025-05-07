
import React, { useEffect } from 'react';
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { MacroDistributionInputsProps } from './types';

const MacroDistributionInputs = ({
  carbsPercentage,
  setCarbsPercentage,
  proteinPercentage,
  setProteinPercentage,
  fatPercentage,
  setFatPercentage,
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
  };
  
  const handleProteinChange = (value: number[]) => {
    setProteinPercentage(value[0].toString());
  };
  
  const handleFatChange = (value: number[]) => {
    setFatPercentage(value[0].toString());
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

  return (
    <div className="space-y-6">
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
      </div>

      {/* Display total and warning if not 100% */}
      <div className={`text-sm ${Math.abs(totalPercentage - 100) < 0.1 ? 'text-green-600' : 'text-amber-600'} font-medium`}>
        Total: {totalPercentage.toFixed(0)}% {Math.abs(totalPercentage - 100) >= 0.1 && ' (Deve somar 100%)'}
      </div>
    </div>
  );
};

export default MacroDistributionInputs;
