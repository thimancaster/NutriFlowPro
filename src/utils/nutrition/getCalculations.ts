
import { ActivityLevel, Profile } from '@/types/consultation';

/**
 * Calcula GET usando fatores de atividade específicos por perfil conforme planilha original
 */
export const calculateGET = (tmb: number, activityLevel: ActivityLevel, profile: Profile): number => {
  let activityFactor: number;
  
  // Fatores de atividade específicos por perfil conforme planilha
  switch (profile) {
    case 'eutrofico':
      // Fatores padrão Harris-Benedict para perfil eutrófico
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
      // Fatores ligeiramente reduzidos para perfil com sobrepeso/obesidade
      switch (activityLevel) {
        case 'sedentario': activityFactor = 1.2; break;
        case 'leve': activityFactor = 1.375; break;
        case 'moderado': activityFactor = 1.55; break;
        case 'intenso': activityFactor = 1.725; break;
        case 'muito_intenso': activityFactor = 1.9; break;
        default: activityFactor = 1.2;
      }
      break;
      
    case 'atleta':
      // Fatores padrão para atletas (mesmos valores que eutrófico conforme planilha)
      switch (activityLevel) {
        case 'sedentario': activityFactor = 1.2; break;
        case 'leve': activityFactor = 1.375; break;
        case 'moderado': activityFactor = 1.55; break;
        case 'intenso': activityFactor = 1.725; break;
        case 'muito_intenso': activityFactor = 1.9; break;
        default: activityFactor = 1.2;
      }
      break;
      
    default:
      // Fallback para fatores padrão
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
