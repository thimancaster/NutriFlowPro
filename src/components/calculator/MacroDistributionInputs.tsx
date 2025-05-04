
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MacroDistributionInputsProps {
  carbsPercentage: string;
  setCarbsPercentage: (value: string) => void;
  proteinPercentage: string;
  setProteinPercentage: (value: string) => void;
  fatPercentage: string;
  setFatPercentage: (value: string) => void;
}

const MacroDistributionInputs = ({
  carbsPercentage,
  setCarbsPercentage,
  proteinPercentage,
  setProteinPercentage,
  fatPercentage,
  setFatPercentage
}: MacroDistributionInputsProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="carbs">
          Carboidratos (%) - {carbsPercentage}%
        </Label>
        <Input 
          id="carbs" 
          type="range" 
          min="0" 
          max="100" 
          value={carbsPercentage} 
          onChange={(e) => {
            setCarbsPercentage(e.target.value);
            setProteinPercentage((100 - parseInt(e.target.value) - parseInt(fatPercentage)).toString());
          }}
          className="w-full"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="protein">
          Proteínas (%) - {proteinPercentage}%
        </Label>
        <Input 
          id="protein" 
          type="range" 
          min="0" 
          max="100" 
          value={proteinPercentage} 
          onChange={(e) => {
            setProteinPercentage(e.target.value);
            setCarbsPercentage((100 - parseInt(e.target.value) - parseInt(fatPercentage)).toString());
          }}
          className="w-full"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="fat">
          Gorduras (%) - {fatPercentage}%
        </Label>
        <Input 
          id="fat" 
          type="range" 
          min="0" 
          max="100" 
          value={fatPercentage} 
          onChange={(e) => {
            setFatPercentage(e.target.value);
            setProteinPercentage((100 - parseInt(carbsPercentage) - parseInt(e.target.value)).toString());
          }}
          className="w-full"
        />
      </div>

      <div className="text-center text-sm text-gray-500">
        Total: {parseInt(carbsPercentage) + parseInt(proteinPercentage) + parseInt(fatPercentage)}% (deve ser 100%)
      </div>
    </div>
  );
};

export default MacroDistributionInputs;
