
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Profile } from '@/types/consultation';

interface NutritionInfoProps {
  objective: string;
  activityLevel: string;
  profile: string | Profile;
}

const NutritionInfo: React.FC<NutritionInfoProps> = ({
  objective,
  activityLevel,
  profile
}) => {
  // Get readable labels for the enum values
  const getObjectiveLabel = (obj: string): string => {
    switch (obj) {
      case 'emagrecimento': return 'Emagrecimento (déficit de 20%)';
      case 'manutenção': return 'Manutenção';
      case 'hipertrofia': return 'Hipertrofia (superávit de 15%)';
      default: return obj;
    }
  };
  
  const getActivityLabel = (act: string): string => {
    switch (act) {
      case 'sedentario': return 'Sedentário (1.2)';
      case 'leve': return 'Levemente ativo (1.375)';
      case 'moderado': return 'Moderadamente ativo (1.55)';
      case 'intenso': return 'Muito ativo (1.725)';
      case 'muito_intenso': return 'Extremamente ativo (1.9)';
      default: return act;
    }
  };
  
  const getProfileLabel = (prf: string | Profile): string => {
    switch (prf) {
      case 'eutrofico': return 'Eutrófico';
      case 'sobrepeso_obesidade': return 'Sobrepeso/Obesidade';
      case 'atleta': return 'Atleta';
      case 'magro': return 'Eutrófico'; // For backward compatibility
      case 'obeso': return 'Sobrepeso/Obesidade'; // For backward compatibility
      default: return String(prf);
    }
  };
  
  return (
    <Card className="mt-4 bg-gray-50">
      <CardContent className="p-4 text-sm space-y-1">
        <div className="grid grid-cols-2">
          <div className="text-gray-600">Objetivo:</div>
          <div className="font-medium">{getObjectiveLabel(objective)}</div>
        </div>
        <div className="grid grid-cols-2">
          <div className="text-gray-600">Atividade física:</div>
          <div className="font-medium">{getActivityLabel(activityLevel)}</div>
        </div>
        <div className="grid grid-cols-2">
          <div className="text-gray-600">Perfil:</div>
          <div className="font-medium">{getProfileLabel(profile)}</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NutritionInfo;
