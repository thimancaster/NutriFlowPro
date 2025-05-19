
import React from 'react';

interface CalorieAdjustmentBadgeProps {
  adjustment: number;
  objective: string;
}

const CalorieAdjustmentBadge: React.FC<CalorieAdjustmentBadgeProps> = ({ 
  adjustment, 
  objective 
}) => {
  let bgColor = "bg-gray-100 text-gray-800";
  let label = "Manutenção";
  
  if (adjustment < 0) {
    bgColor = "bg-red-100 text-red-800";
    label = "Déficit calórico";
  } else if (adjustment > 0) {
    bgColor = "bg-green-100 text-green-800";
    label = "Superávit calórico";
  }
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor}`}>
      {label} ({adjustment > 0 ? '+' : ''}{adjustment} kcal)
    </span>
  );
};

export default CalorieAdjustmentBadge;
