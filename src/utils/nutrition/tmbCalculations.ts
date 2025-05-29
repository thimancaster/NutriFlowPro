
import { Profile } from '@/types/consultation';

/**
 * Calcula TMB usando a fórmula correta baseada no perfil
 */
export const calculateTMB = (weight: number, height: number, age: number, sex: 'M' | 'F', profile: Profile): number => {
  if (weight <= 0 || height <= 0 || age <= 0) {
    throw new Error('Weight, height, and age must be positive values');
  }
  
  let tmb: number;
  
  switch (profile) {
    case 'eutrofico':
      // Harris-Benedict revisada para perfil eutrófico - constantes corrigidas conforme planilha
      if (sex === 'M') {
        tmb = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
      } else {
        tmb = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
      }
      break;
      
    case 'sobrepeso_obesidade':
      // Harris-Benedict clássica para sobrepeso/obesidade conforme planilha original
      if (sex === 'M') {
        tmb = 66.5 + (13.75 * weight) + (5.003 * height) - (6.755 * age);
      } else {
        tmb = 655.1 + (9.563 * weight) + (1.850 * height) - (4.676 * age);
      }
      break;
      
    case 'atleta':
      // Cunningham para atletas (aproximação quando massa magra não disponível)
      // Assumindo 10-15% de gordura corporal para atletas
      const estimatedLeanMass = weight * 0.85; // 15% gordura
      tmb = 500 + (22 * estimatedLeanMass);
      break;
      
    default:
      // Fallback para Harris-Benedict revisada - constantes corrigidas conforme planilha
      if (sex === 'M') {
        tmb = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
      } else {
        tmb = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
      }
  }
  
  return Math.round(tmb);
};
