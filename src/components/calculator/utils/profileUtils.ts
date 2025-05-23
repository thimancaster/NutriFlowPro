
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
    case 'normal':
      return 'normal';
    case 'sobrepeso':
      return 'sobrepeso';
    // Body types - use exact string values for clarity
    case 'ectomorfo':
    case 'ectomorph':
      return 'magro';  // Map consistently to 'magro'
    case 'mesomorfo':
    case 'mesomorph':
      return 'normal';  // Map consistently to 'normal'
    case 'endomorfo':
    case 'endomorph':
      return 'sobrepeso';  // Map consistently to 'sobrepeso'
    // Handle legacy profiles
    case 'eutrofico':
      return 'normal';  // Map to 'normal'
    case 'sobrepeso_obesidade':
      return 'sobrepeso';  // Map to 'sobrepeso'
    default:
      // If the value doesn't match exactly, try to determine closest match
      if (normalizedValue.includes('peso') || normalizedValue.includes('obre') || normalizedValue.includes('endo')) {
        return 'sobrepeso';
      } else if (normalizedValue.includes('atleta')) {
        return 'atleta';
      } else if (normalizedValue.includes('ecto') || normalizedValue.includes('magr')) {
        return 'magro';
      } else if (normalizedValue.includes('meso') || normalizedValue.includes('medi')) {
        return 'normal';
      } else {
        return 'normal'; // Default fallback
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
    case 'atleta':
      return 'Atleta';
    case 'magro':
      return 'Magro/Ectomorfo';
    case 'normal':
      return 'Normal/Mesomorfo';
    case 'sobrepeso':
      return 'Sobrepeso/Endomorfo';
    case 'obeso':
      return 'Obeso';
    default:
      return String(profile);
  }
};
