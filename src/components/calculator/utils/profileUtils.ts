
import { Profile } from '@/types/consultation';

/**
 * Safely converts a string to Profile type
 */
export const stringToProfile = (value: string): Profile => {
  // Normalize the input value by trimming and converting to lowercase
  const normalizedValue = String(value).trim().toLowerCase();
  
  switch (normalizedValue) {
    case 'magro':
      return 'magro';
    case 'obeso':
      return 'obeso';
    case 'atleta':
      return 'atleta';
    case 'eutrofico':
      return 'eutrofico';
    case 'sobrepeso_obesidade':
      return 'sobrepeso_obesidade';
    case 'normal':
      return 'normal';
    case 'sobrepeso':
      return 'sobrepeso';
    default:
      // If the value doesn't match exactly, try to determine closest match
      if (normalizedValue.includes('peso') || normalizedValue.includes('obre')) {
        return 'sobrepeso_obesidade';
      } else if (normalizedValue.includes('atleta')) {
        return 'atleta';
      } else {
        return 'eutrofico'; // Default fallback
      }
  }
};

/**
 * Get profile display label
 */
export const getProfileLabel = (profile: Profile | string): string => {
  // Ensure we're working with a normalized profile value
  const normalizedProfile = stringToProfile(String(profile));
  
  switch (normalizedProfile) {
    case 'eutrofico':
      return 'Eutrófico';
    case 'sobrepeso_obesidade':
      return 'Sobrepeso/Obesidade';
    case 'atleta':
      return 'Atleta';
    case 'magro':
      return 'Magro';
    case 'normal':
      return 'Normal';
    case 'sobrepeso':
      return 'Sobrepeso';
    case 'obeso':
      return 'Obeso';
    default:
      return String(profile);
  }
};
