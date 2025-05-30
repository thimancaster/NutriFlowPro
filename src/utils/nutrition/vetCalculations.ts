
/**
 * VET (Valor Energético Total) Calculations
 * Calcula o gasto energético total considerando atividade física e objetivos
 */

import { ActivityLevel, Objective } from '@/types/consultation';

export interface VETResult {
  get: number; // Gasto Energético Total base
  vet: number; // Valor Energético Total ajustado para objetivo
  adjustment: number; // Ajuste calórico aplicado
  activityFactor: number;
  objectiveAdjustment: number;
}

/**
 * Fatores de atividade física mais precisos
 * Baseados em estudos recentes e diferenciados por perfil
 */
const ACTIVITY_FACTORS = {
  sedentario: {
    standard: 1.2,
    athlete: 1.3 // Atletas têm metabolismo basal mais alto mesmo em repouso
  },
  leve: {
    standard: 1.375,
    athlete: 1.45
  },
  moderado: {
    standard: 1.55,
    athlete: 1.65
  },
  intenso: {
    standard: 1.725,
    athlete: 1.85
  },
  muito_intenso: {
    standard: 1.9,
    athlete: 2.1 // Atletas de elite podem chegar a 2.2-2.4
  }
} as const;

/**
 * Ajustes calóricos por objetivo (em percentual)
 */
const OBJECTIVE_ADJUSTMENTS = {
  emagrecimento: {
    standard: -0.20, // -20% para população geral
    athlete: -0.15   // -15% para atletas (evitar perda de massa magra)
  },
  manutenção: {
    standard: 0,
    athlete: 0
  },
  hipertrofia: {
    standard: 0.15,  // +15% para população geral
    athlete: 0.20    // +20% para atletas (maior demanda anabólica)
  }
} as const;

/**
 * Calcula VET considerando perfil, atividade e objetivo
 */
export function calculateVET(
  tmb: number,
  activityLevel: ActivityLevel,
  objective: Objective,
  profile: 'magro' | 'obeso' | 'atleta'
): VETResult {
  // Determinar fator de atividade baseado no perfil
  const isAthlete = profile === 'atleta';
  const activityFactor = ACTIVITY_FACTORS[activityLevel][isAthlete ? 'athlete' : 'standard'];
  
  // Calcular GET (Gasto Energético Total)
  const get = tmb * activityFactor;
  
  // Determinar ajuste por objetivo
  const objectiveAdjustment = OBJECTIVE_ADJUSTMENTS[objective][isAthlete ? 'athlete' : 'standard'];
  
  // Calcular ajuste calórico
  const adjustment = get * objectiveAdjustment;
  
  // Calcular VET final
  const vet = get + adjustment;

  return {
    get: Math.round(get),
    vet: Math.round(vet),
    adjustment: Math.round(adjustment),
    activityFactor,
    objectiveAdjustment
  };
}

/**
 * Validação específica para cálculo VET
 */
export function validateVETParameters(
  tmb: number,
  activityLevel: ActivityLevel,
  objective: Objective
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (tmb <= 0 || tmb > 4000) {
    errors.push('TMB deve estar entre 1 e 4000 kcal');
  }

  if (!Object.keys(ACTIVITY_FACTORS).includes(activityLevel)) {
    errors.push('Nível de atividade inválido');
  }

  if (!Object.keys(OBJECTIVE_ADJUSTMENTS).includes(objective)) {
    errors.push('Objetivo inválido');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Calcula VET para diferentes cenários (comparação)
 */
export function calculateVETScenarios(
  tmb: number,
  profile: 'magro' | 'obeso' | 'atleta'
): Record<string, Record<string, number>> {
  const scenarios: Record<string, Record<string, number>> = {};
  
  const activities: ActivityLevel[] = ['sedentario', 'leve', 'moderado', 'intenso', 'muito_intenso'];
  const objectives: Objective[] = ['emagrecimento', 'manutenção', 'hipertrofia'];
  
  activities.forEach(activity => {
    scenarios[activity] = {};
    objectives.forEach(objective => {
      const result = calculateVET(tmb, activity, objective, profile);
      scenarios[activity][objective] = result.vet;
    });
  });
  
  return scenarios;
}

/**
 * Recomendações específicas para atletas
 */
export function getAthleteRecommendations(
  vet: number,
  objective: Objective,
  activityLevel: ActivityLevel
): string[] {
  const recommendations: string[] = [];
  
  if (objective === 'emagrecimento') {
    recommendations.push('Para atletas em cutting, monitorar performance e massa magra');
    recommendations.push('Considerar periodização nutricional conforme treinos');
  }
  
  if (objective === 'hipertrofia') {
    recommendations.push('Distribuir calorias em múltiplas refeições ao longo do dia');
    recommendations.push('Timing nutricional importante: pré e pós-treino');
  }
  
  if (activityLevel === 'muito_intenso') {
    recommendations.push('Monitorar sinais de overtraining');
    recommendations.push('Adequar hidratação e reposição eletrolítica');
  }
  
  return recommendations;
}
