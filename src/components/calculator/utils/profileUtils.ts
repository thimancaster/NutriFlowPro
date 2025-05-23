
import { Profile } from '@/types/consultation';

/**
 * Safely convert a string to a valid Profile type
 * This handles both legacy and current profile names
 */
export const stringToProfile = (value: string | Profile): Profile => {
  // Handle the case where value is already a valid Profile
  if (['magro', 'normal', 'sobrepeso', 'obeso', 'atleta', 'eutrofico', 'sobrepeso_obesidade'].includes(value as string)) {
    return value as Profile;
  }
  
  // Map legacy or alternate names to valid Profile values
  switch (value) {
    case 'eutrofico':
      return 'magro';
    case 'sobrepeso_obesidade':
      return 'sobrepeso';
    default:
      return 'normal'; // Default fallback
  }
};
