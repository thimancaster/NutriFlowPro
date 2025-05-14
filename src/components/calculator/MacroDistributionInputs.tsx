import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface MacroDistributionInputsProps {
  carbsPercentage: string;
  setCarbsPercentage: (value: string) => void;
  proteinPercentage: string;
  setProteinPercentage: (value: string) => void;
  fatPercentage: string;
  setFatPercentage: (value: string) => void;
  bmr: number; // Added required prop
  tee: number; // Added required prop
  objective: string; // Added required prop
}

const MacroDistributionInputs: React.FC<MacroDistributionInputsProps> = ({
  carbsPercentage,
  setCarbsPercentage,
  proteinPercentage,
  setProteinPercentage,
  fatPercentage,
  setFatPercentage,
  bmr,
  tee,
  objective,
}) => {
  // Helpers to validate numeric inputs
  const handleNumericInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (value: string) => void
  ) => {
    const value = e.target.value;
    // Allow only numbers and a single decimal point
    if (/^\d*\.?\d*$/.test(value)) {
      setter(value);
    }
  };

  // Calculate total percentage
  const totalPercentage =
    Number(carbsPercentage) + Number(proteinPercentage) + Number(fatPercentage);

  // Determine if the total is valid
  const isValidTotal = Math.abs(totalPercentage - 100) < 1; // Allow small rounding errors

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between mb-0">
        <h3 className="text-base font-medium">Distribuição de macronutrientes</h3>
        <div className={`text-sm ${isValidTotal ? 'text-green-500' : 'text-red-500'}`}>
          {totalPercentage}% / 100%
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label htmlFor="carbsPercentage" className="text-xs mb-1 block">
            Carboidratos (%)
          </Label>
          <Input
            id="carbsPercentage"
            value={carbsPercentage}
            onChange={(e) => handleNumericInputChange(e, setCarbsPercentage)}
            className={`text-center ${
              !isValidTotal ? 'border-red-300 focus:ring-red-500' : ''
            }`}
          />
        </div>
        <div>
          <Label htmlFor="proteinPercentage" className="text-xs mb-1 block">
            Proteínas (%)
          </Label>
          <Input
            id="proteinPercentage"
            value={proteinPercentage}
            onChange={(e) => handleNumericInputChange(e, setProteinPercentage)}
            className={`text-center ${
              !isValidTotal ? 'border-red-300 focus:ring-red-500' : ''
            }`}
          />
        </div>
        <div>
          <Label htmlFor="fatPercentage" className="text-xs mb-1 block">
            Gorduras (%)
          </Label>
          <Input
            id="fatPercentage"
            value={fatPercentage}
            onChange={(e) => handleNumericInputChange(e, setFatPercentage)}
            className={`text-center ${
              !isValidTotal ? 'border-red-300 focus:ring-red-500' : ''
            }`}
          />
        </div>
      </div>

      {!isValidTotal && (
        <p className="text-xs text-red-500 mt-1">
          A soma dos percentuais deve ser exatamente 100%.
        </p>
      )}
    </div>
  );
};

export default MacroDistributionInputs;
