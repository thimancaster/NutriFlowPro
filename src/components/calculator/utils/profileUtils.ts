
import { Profile } from '@/types/consultation';

/**
 * Safely converts a string to Profile type
 */
export const stringToProfile = (value: string): Profile => {
  // Normalize the input value by trimming and converting to lowercase
  const normalizedValue = String(value).trim().toLowerCase();
  
  switch (normalizedValue) {
    case 'magro':
      return 'eutrofico'; // Map old 'magro' to 'eutrofico'
    case 'obeso':
      return 'sobrepeso_obesidade'; // Map old 'obeso' to 'sobrepeso_obesidade'
    case 'atleta':
      return 'atleta';
    case 'eutrofico':
      return 'eutrofico';
    case 'sobrepeso_obesidade':
      return 'sobrepeso_obesidade';
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
    default:
      return String(profile);
  }
};
