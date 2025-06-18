
import { Profile } from '@/types/consultation';

// Função para converter string para Profile com mapeamento unificado
export const stringToProfile = (value: string): Profile => {
  const validProfiles: Profile[] = ['eutrofico', 'sobrepeso_obesidade', 'atleta'];
  
  // Mapeamento completo e consistente
  const profileMapping: Record<string, Profile> = {
    // Valores novos (mantidos)
    'eutrofico': 'eutrofico',
    'sobrepeso_obesidade': 'sobrepeso_obesidade',
    'atleta': 'atleta',
    
    // Valores antigos (mapeados)
    'magro': 'eutrofico',
    'obeso': 'sobrepeso_obesidade',
    'normal': 'eutrofico',
    'sobrepeso': 'sobrepeso_obesidade',
    
    // Valores por extenso
    'eutrópico': 'eutrofico',
    'eutrófico': 'eutrofico',
    'eutrofico (normal)': 'eutrofico',
    'sobrepeso/obesidade': 'sobrepeso_obesidade',
    
    // Mapeamento por nível de atividade (fallback)
    'sedentário': 'eutrofico',
    'sedentario': 'eutrofico',
    'leve': 'eutrofico',
    'moderado': 'eutrofico',
    'intenso': 'sobrepeso_obesidade',
    'muito_intenso': 'atleta'
  };
  
  const normalizedValue = value.toLowerCase().trim();
  const mappedProfile = profileMapping[normalizedValue];
  
  if (mappedProfile && validProfiles.includes(mappedProfile)) {
    return mappedProfile;
  }
  
  console.warn(`Profile value "${value}" not recognized, defaulting to 'eutrofico'`);
  return 'eutrofico';
};

// Função para converter Profile para valores legacy quando necessário
export const profileToLegacy = (profile: Profile): 'magro' | 'obeso' | 'atleta' => {
  const legacyMapping: Record<Profile, 'magro' | 'obeso' | 'atleta'> = {
    'eutrofico': 'magro',
    'sobrepeso_obesidade': 'obeso',
    'atleta': 'atleta'
  };
  
  return legacyMapping[profile] || 'magro';
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
