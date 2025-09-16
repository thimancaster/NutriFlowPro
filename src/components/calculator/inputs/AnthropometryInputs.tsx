
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface AnthropometryInputsProps {
  weight: string;
  setWeight: (weight: string) => void;
  height: string;
  setHeight: (height: string) => void;
}

const AnthropometryInputs: React.FC<AnthropometryInputsProps> = ({
  weight,
  setWeight,
  height,
  setHeight
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Height */}
      <div className="space-y-2">
        <Label htmlFor="height">
          Altura (cm) <span className="text-red-500">*</span>
        </Label>
        <Input
          id="height"
          type="number"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          placeholder="Em centímetros"
          className="w-full"
          min="50"
          max="250"
        />
      </div>
      
      {/* Weight */}
      <div className="space-y-2">
        <Label htmlFor="weight">
          Peso (kg) <span className="text-red-500">*</span>
        </Label>
        <Input
          id="weight"
          type="number"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="Em quilogramas"
          className="w-full"
          min="1"
          max="500"
          step="0.1"
        />
      </div>
    </div>
  );
};

export default AnthropometryInputs;
