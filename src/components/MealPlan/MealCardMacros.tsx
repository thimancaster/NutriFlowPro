
import React from 'react';

interface MealCardMacrosProps {
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
}

const MealCardMacros = ({ protein, carbs, fat, calories }: MealCardMacrosProps) => {
  return (
    <div className="space-y-2 mt-3">
      <div className="flex justify-between text-xs">
        <span>Proteínas</span>
        <span>{protein}g</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div 
          className="bg-nutri-blue h-1.5 rounded-full" 
          style={{ width: `${(protein * 4 * 100) / (calories || 1)}%` }}
        ></div>
      </div>
      
      <div className="flex justify-between text-xs">
        <span>Carboidratos</span>
        <span>{carbs}g</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div 
          className="bg-nutri-green h-1.5 rounded-full" 
          style={{ width: `${(carbs * 4 * 100) / (calories || 1)}%` }}
        ></div>
      </div>
      
      <div className="flex justify-between text-xs">
        <span>Gorduras</span>
        <span>{fat}g</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div 
          className="bg-amber-500 h-1.5 rounded-full" 
          style={{ width: `${(fat * 9 * 100) / (calories || 1)}%` }}
        ></div>
      </div>
    </div>
  );
};

export default MealCardMacros;
