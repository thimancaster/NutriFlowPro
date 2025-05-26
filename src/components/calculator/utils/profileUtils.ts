
import { Profile } from '@/types/consultation';

/**
 * Safely convert a string to a valid Profile type
 * This handles both legacy and current profile names
 */
export const stringToProfile = (value: string | Profile): Profile => {
  // Handle the case where value is already a valid Profile
  if (['eutrofico', 'sobrepeso_obesidade', 'atleta'].includes(value as string)) {
    return value as Profile;
  }
  
  // Map legacy or alternate names to valid Profile values
  switch (value) {
    case 'magro':
    case 'normal':
      return 'eutrofico';
    case 'sobrepeso':
    case 'obeso':
      return 'sobrepeso_obesidade';
    default:
      return 'eutrofico'; // Default fallback
  }
};
