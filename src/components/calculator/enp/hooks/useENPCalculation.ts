
import { useState, useCallback } from 'react';
import { calculateCompleteENP, ENPInputs, ENPResults } from '@/utils/nutrition/enpCalculations';
import { GERFormula } from '@/types/gerFormulas';
import { ActivityLevel as FormActivityLevel, Objective as FormObjective, Profile } from '@/types/consultation';

type ENPActivityLevel = ENPInputs['activityLevel'];
type ENPObjective = ENPInputs['objective'];

const mapActivityLevel = (level: FormActivityLevel): ENPActivityLevel => {
  const mapping: Record<FormActivityLevel, ENPActivityLevel> = {
    sedentario: 'sedentario',
    leve: 'leve',
    moderado: 'moderado',
    intenso: 'muito_ativo',
    muito_intenso: 'extremamente_ativo',
  };
  return mapping[level] || 'sedentario';
};

const mapObjective = (objective: FormObjective): ENPObjective => {
  const mapping: Record<FormObjective, ENPObjective> = {
    emagrecimento: 'perder_peso',
    manutenção: 'manter_peso',
    hipertrofia: 'ganhar_peso',
    personalizado: 'manter_peso', // Defaulting to maintain
  };
  return mapping[objective] || 'manter_peso';
};

interface CalculationData {
    weight: number;
    height: number;
    age: number;
    sex: 'M' | 'F';
    activityLevel: FormActivityLevel;
    objective: FormObjective;
    profile: Profile;
    gerFormula?: GERFormula;
    bodyFatPercentage?: number;
}

export const useENPCalculation = () => {
    const [results, setResults] = useState<ENPResults | null>(null);
    const [isCalculating, setIsCalculating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCalculate = useCallback(async (data: CalculationData, isValid: boolean) => {
        if (!isValid || !data.gerFormula) {
            setError('Por favor, preencha todos os campos obrigatórios e selecione uma fórmula GER.');
            setResults(null);
            return;
        }

        setIsCalculating(true);
        setError(null);
        setResults(null);

        try {
            const inputs: ENPInputs = {
                ...data,
                activityLevel: mapActivityLevel(data.activityLevel),
                objective: mapObjective(data.objective),
                gerFormula: data.gerFormula,
            };
            const calculatedResults = calculateCompleteENP(inputs);
            setResults(calculatedResults);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Ocorreu um erro desconhecido durante o cálculo.');
            console.error(e);
        } finally {
            setIsCalculating(false);
        }
    }, []);

    const reset = () => {
        setResults(null);
        setError(null);
    }

    return {
        handleCalculate,
        isCalculating,
        error,
        results,
        reset
    };
};
