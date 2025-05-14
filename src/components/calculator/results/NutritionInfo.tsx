
import React from 'react';

interface NutritionInfoProps {
  macros: {
    proteinPerKg?: number;
  };
}

const NutritionInfo = ({ macros }: NutritionInfoProps) => {
  return (
    <div className="mt-4 bg-blue-50 p-3 rounded border border-blue-200">
      <h4 className="text-sm font-medium text-blue-800">Informações Adicionais</h4>
      <ul className="mt-1 text-xs text-blue-800 space-y-1">
        <li>• Carboidratos e proteínas fornecem 4 kcal/g</li>
        <li>• Gorduras fornecem 9 kcal/g</li>
        {macros.proteinPerKg && (
          <li>• Recomendação de proteína: {macros.proteinPerKg.toFixed(1)} g/kg de peso corporal</li>
        )}
      </ul>
    </div>
  );
};

export default NutritionInfo;
