
import { Profile } from '@/types/consultation';

// Valores padronizados para perfil (apenas os novos)
export const STANDARD_PROFILES = ['eutrofico', 'sobrepeso_obesidade', 'atleta'] as const;

// Função para converter qualquer string para Profile padronizado
export const stringToProfile = (value: string): Profile => {
  // Mapeamento completo de valores antigos para novos
  const profileMapping: Record<string, Profile> = {
    // Valores padrão (mantidos)
    'eutrofico': 'eutrofico',
    'sobrepeso_obesidade': 'sobrepeso_obesidade', 
    'atleta': 'atleta',
    
    // Valores legacy (convertidos)
    'magro': 'eutrofico',
    'normal': 'eutrofico',
    'obeso': 'sobrepeso_obesidade',
    'sobrepeso': 'sobrepeso_obesidade',
    
    // Valores por extenso
    'eutrópico': 'eutrofico',
    'eutrófico': 'eutrofico',
    'eutrofico (normal)': 'eutrofico',
    'sobrepeso/obesidade': 'sobrepeso_obesidade',
    
    // Valores de atividade física (fallback)
    'sedentário': 'eutrofico',
    'sedentario': 'eutrofico',
    'leve': 'eutrofico',
    'moderado': 'eutrofico',
    'intenso': 'sobrepeso_obesidade',
    'muito_intenso': 'atleta'
  };
  
  const normalizedValue = value.toLowerCase().trim();
  const mappedProfile = profileMapping[normalizedValue];
  
  if (mappedProfile && STANDARD_PROFILES.includes(mappedProfile)) {
    console.log(`Profile mapped: "${value}" -> "${mappedProfile}"`);
    return mappedProfile;
  }
  
  console.warn(`Profile value "${value}" not recognized, defaulting to 'eutrofico'`);
  return 'eutrofico';
};

// Função para converter Profile para valores legacy (apenas quando necessário para cálculos)
export const profileToLegacy = (profile: Profile): 'magro' | 'obeso' | 'atleta' => {
  const legacyMapping: Record<Profile, 'magro' | 'obeso' | 'atleta'> = {
    'eutrofico': 'magro',
    'sobrepeso_obesidade': 'obeso', 
    'atleta': 'atleta'
  };
  
  const legacyValue = legacyMapping[profile] || 'magro';
  console.log(`Profile to legacy: "${profile}" -> "${legacyValue}"`);
  return legacyValue;
};

// Função para obter o label do perfil
export const getProfileLabel = (profile: Profile): string => {
  const labels: Record<Profile, string> = {
    'eutrofico': 'Eutrófico',
    'sobrepeso_obesidade': 'Sobrepeso/Obesidade',
    'atleta': 'Atleta'
  };
  
  return labels[profile] || profile;
};

// Opções padronizadas para o select de perfil
export const PROFILE_OPTIONS = [
  { value: 'eutrofico', label: 'Eutrófico' },
  { value: 'sobrepeso_obesidade', label: 'Sobrepeso/Obesidade' },
  { value: 'atleta', label: 'Atleta' }
] as const;

// Função para validar se um valor é um Profile válido
export const isValidProfile = (value: string): value is Profile => {
  return STANDARD_PROFILES.includes(value as Profile);
};
