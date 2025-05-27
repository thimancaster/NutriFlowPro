
import { Profile } from '@/types/consultation';

// Função para converter string para Profile
export const stringToProfile = (value: string): Profile => {
  const validProfiles: Profile[] = ['eutrofico', 'sobrepeso_obesidade', 'atleta'];
  
  // Mapeamento para compatibilidade com valores antigos
  const profileMapping: Record<string, Profile> = {
    'magro': 'eutrofico',
    'eutrofico': 'eutrofico',
    'normal': 'eutrofico',
    'obeso': 'sobrepeso_obesidade',
    'sobrepeso_obesidade': 'sobrepeso_obesidade',
    'sobrepeso': 'sobrepeso_obesidade',
    'atleta': 'atleta',
    'sedentário': 'eutrofico',
    'moderado': 'eutrofico',
    'ativo': 'sobrepeso_obesidade',
    'muito ativo': 'atleta'
  };
  
  const normalizedValue = value.toLowerCase().trim();
  const mappedProfile = profileMapping[normalizedValue];
  
  if (mappedProfile && validProfiles.includes(mappedProfile)) {
    return mappedProfile;
  }
  
  console.warn(`Profile value "${value}" not recognized, defaulting to 'eutrofico'`);
  return 'eutrofico';
};

// Função para obter o label do perfil
export const getProfileLabel = (profile: Profile): string => {
  const labels: Record<Profile, string> = {
    'eutrofico': 'Eutrófico (Normal)',
    'sobrepeso_obesidade': 'Sobrepeso/Obesidade',
    'atleta': 'Atleta'
  };
  
  return labels[profile] || profile;
};

// Opções para o select de perfil
export const PROFILE_OPTIONS = [
  { value: 'eutrofico', label: 'Eutrófico (Normal)' },
  { value: 'sobrepeso_obesidade', label: 'Sobrepeso/Obesidade' },
  { value: 'atleta', label: 'Atleta' }
] as const;
