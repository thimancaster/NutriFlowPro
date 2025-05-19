
import { Profile } from '@/types/consultation';

/**
 * Safely converts a string to Profile type
 */
export const stringToProfile = (value: string): Profile => {
  switch (value) {
    case 'magro':
      return 'eutrofico'; // Map old 'magro' to 'eutrofico'
    case 'obeso':
      return 'sobrepeso_obesidade'; // Map old 'obeso' to 'sobrepeso_obesidade'
    case 'atleta':
      return 'atleta';
    case 'eutrofico':
    case 'sobrepeso_obesidade':
      return value as Profile;
    default:
      return 'eutrofico'; // Default fallback
  }
};

/**
 * Get profile display label
 */
export const getProfileLabel = (profile: Profile | string): string => {
  switch (profile) {
    case 'eutrofico':
      return 'Eutrófico';
    case 'sobrepeso_obesidade':
      return 'Sobrepeso/Obesidade';
    case 'atleta':
      return 'Atleta';
    case 'magro':
      return 'Eutrófico'; // For backward compatibility
    case 'obeso':
      return 'Sobrepeso/Obesidade'; // For backward compatibility
    default:
      return String(profile);
  }
};
