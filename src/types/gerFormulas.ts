
// Tipos para seleção de fórmulas GER (Gasto Energético de Repouso)

export type GERFormula = 
  | 'harris_benedict_revisada'
  | 'mifflin_st_jeor'
  | 'owen'
  | 'katch_mcardle'
  | 'cunningham'
  | 'schofield';

export interface GERFormulaInfo {
  id: GERFormula;
  name: string;
  description: string;
  indication: string;
  tooltipText: string;
  requiresBodyFat?: boolean;
}

export const GER_FORMULAS: Record<GERFormula, GERFormulaInfo> = {
  harris_benedict_revisada: {
    id: 'harris_benedict_revisada',
    name: 'Harris-Benedict Revisada',
    description: 'Padrão geral para adultos. Pode superestimar o gasto energético.',
    indication: 'Uso geral',
    tooltipText: 'Padrão geral para adultos. Pode superestimar o gasto energético, mas ainda é amplamente utilizada para estimativas rápidas.'
  },
  mifflin_st_jeor: {
    id: 'mifflin_st_jeor',
    name: 'Mifflin-St Jeor',
    description: 'Recomendada para adultos saudáveis com IMC normal.',
    indication: 'Adultos saudáveis',
    tooltipText: 'Recomendada para adultos saudáveis. Considerada mais precisa que Harris-Benedict para indivíduos com IMC normal.'
  },
  owen: {
    id: 'owen',
    name: 'Owen',
    description: 'Indicada para sobrepeso/obesidade, evita superestimação.',
    indication: 'Pacientes obesos',
    tooltipText: 'Indicada para pessoas com sobrepeso ou obesidade. Usa apenas o peso corporal, evitando superestimação em altos percentuais de gordura.'
  },
  katch_mcardle: {
    id: 'katch_mcardle',
    name: 'Katch-McArdle',
    description: 'Ideal para atletas com % de gordura conhecido. Baseada na massa magra.',
    indication: 'Atletas com % gordura conhecido',
    requiresBodyFat: true,
    tooltipText: 'Ideal para atletas e praticantes de atividade física com % de gordura conhecido. Baseada na massa magra.'
  },
  cunningham: {
    id: 'cunningham',
    name: 'Cunningham',
    description: 'Para atletas de elite. Exige dados confiáveis de massa magra.',
    indication: 'Atletas de elite e fisiculturistas',
    requiresBodyFat: true,
    tooltipText: 'Recomendada para atletas de elite ou fisiculturistas. Exige dados confiáveis de massa magra para maior precisão.'
  },
  schofield: {
    id: 'schofield',
    name: 'Schofield',
    description: 'Padrão internacional (FAO/OMS) para todas as idades.',
    indication: 'Populações diversas (inclusive pediatria)',
    tooltipText: 'Usada para estimativas populacionais e por instituições. Aplicável a crianças, adolescentes, adultos e idosos.'
  }
};
