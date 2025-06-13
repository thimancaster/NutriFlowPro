
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
  requiresBodyFat?: boolean;
}

export const GER_FORMULAS: Record<GERFormula, GERFormulaInfo> = {
  harris_benedict_revisada: {
    id: 'harris_benedict_revisada',
    name: 'Harris-Benedict Revisada',
    description: 'Fórmula clássica revisada para maior precisão',
    indication: 'Padrão ENP - Recomendada para uso geral'
  },
  mifflin_st_jeor: {
    id: 'mifflin_st_jeor',
    name: 'Mifflin-St Jeor',
    description: 'Mais precisa para população geral moderna',
    indication: 'Recomendada para adultos saudáveis'
  },
  owen: {
    id: 'owen',
    name: 'Owen',
    description: 'Específica para pessoas com sobrepeso/obesidade',
    indication: 'Indicada para pacientes obesos'
  },
  katch_mcardle: {
    id: 'katch_mcardle',
    name: 'Katch-McArdle',
    description: 'Considera massa magra corporal',
    indication: 'Para atletas com % gordura conhecida',
    requiresBodyFat: true
  },
  cunningham: {
    id: 'cunningham',
    name: 'Cunningham',
    description: 'Para atletas de elite com alta massa magra',
    indication: 'Atletas de elite e fisiculturistas',
    requiresBodyFat: true
  },
  schofield: {
    id: 'schofield',
    name: 'Schofield',
    description: 'Recomendada pela FAO/WHO/UNU',
    indication: 'Padrão internacional para diversas populações'
  }
};
