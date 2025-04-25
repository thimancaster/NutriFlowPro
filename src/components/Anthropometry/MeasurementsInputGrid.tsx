
import React from 'react';
import { Input } from "@/components/ui/input";

interface MeasurementField {
  name: string;
  label: string;
}

interface MeasurementsInputGridProps {
  fields: MeasurementField[];
  values: Record<string, number | null | string>; // Updated to accept string values as well
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const MeasurementsInputGrid: React.FC<MeasurementsInputGridProps> = ({
  fields,
  values,
  onChange
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {fields.map((field) => (
        <div key={field.name} className="flex flex-col">
          <label htmlFor={field.name} className="text-sm font-medium mb-1">
            {field.label}
          </label>
          <Input
            id={field.name}
            name={field.name}
            type="number"
            step="any"
            value={typeof values[field.name] === 'number' || values[field.name] === null ? values[field.name] || '' : ''}
            onChange={onChange}
            placeholder={`Digite o ${field.label.toLowerCase()}`}
            className="mb-4"
          />
        </div>
      ))}
    </div>
  );
};

export default MeasurementsInputGrid;
