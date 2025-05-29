
import { ActivityLevel, Profile } from '@/types/consultation';

/**
 * Calcula GET usando fatores de atividade específicos por perfil
 */
export const calculateGET = (tmb: number, activityLevel: ActivityLevel, profile: Profile): number => {
  let activityFactor: number;
  
  // Fatores de atividade específicos por perfil conforme planilha
  switch (profile) {
    case 'eutrofico':
      switch (activityLevel) {
        case 'sedentario': activityFactor = 1.2; break;
        case 'leve': activityFactor = 1.375; break;
        case 'moderado': activityFactor = 1.55; break;
        case 'intenso': activityFactor = 1.725; break;
        case 'muito_intenso': activityFactor = 1.9; break;
        default: activityFactor = 1.2;
      }
      break;
      
    case 'sobrepeso_obesidade':
      // Fatores reduzidos para perfil com sobrepeso/obesidade
      switch (activityLevel) {
        case 'sedentario': activityFactor = 1.1; break;
        case 'leve': activityFactor = 1.3; break;
        case 'moderado': activityFactor = 1.5; break;
        case 'intenso': activityFactor = 1.7; break;
        case 'muito_intenso': activityFactor = 1.9; break;
        default: activityFactor = 1.1;
      }
      break;
      
    case 'atleta':
      // Fatores aumentados para atletas
      switch (activityLevel) {
        case 'sedentario': activityFactor = 1.5; break;
        case 'leve': activityFactor = 1.6; break;
        case 'moderado': activityFactor = 1.8; break;
        case 'intenso': activityFactor = 2.1; break;
        case 'muito_intenso': activityFactor = 2.4; break;
        default: activityFactor = 1.5;
      }
      break;
      
    default:
      // Fallback to basic activity factors
      switch (activityLevel) {
        case 'sedentario': activityFactor = 1.2; break;
        case 'leve': activityFactor = 1.375; break;
        case 'moderado': activityFactor = 1.55; break;
        case 'intenso': activityFactor = 1.725; break;
        case 'muito_intenso': activityFactor = 1.9; break;
        default: activityFactor = 1.2;
      }
  }
  
  return Math.round(tmb * activityFactor);
};
