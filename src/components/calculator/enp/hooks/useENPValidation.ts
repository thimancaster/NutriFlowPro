
import { useMemo } from 'react';
import { GERFormula, GER_FORMULAS } from '@/types/gerFormulas';

export interface ENPValidatedData {
  weight: number;
  height: number;
  age: number;
  sex: 'M' | 'F';
  activityLevel: string;
  objective: string;
  profile: string;
  gerFormula: GERFormula;
  bodyFatPercentage?: number;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
}

export const useENPValidation = (
  weight: string,
  height: string,
  age: string,
  sex: 'M' | 'F',
  activityLevel: string,
  objective: string,
  profile: string,
  gerFormula?: GERFormula,
  bodyFatPercentage?: string
) => {
  const validatedData = useMemo(() => {
    const weightNum = parseFloat(weight) || 0;
    const heightNum = parseFloat(height) || 0;
    const ageNum = parseInt(age) || 0;
    const bodyFatNum = bodyFatPercentage ? parseFloat(bodyFatPercentage) : undefined;

    return {
      weight: weightNum,
      height: heightNum,
      age: ageNum,
      sex,
      activityLevel,
      objective,
      profile,
      gerFormula: gerFormula!,
      bodyFatPercentage: bodyFatNum
    };
  }, [weight, height, age, sex, activityLevel, objective, profile, gerFormula, bodyFatPercentage]);

  const { errors, warnings, isValid } = useMemo(() => {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Validações básicas
    if (validatedData.weight <= 0 || validatedData.weight > 500) {
      errors.push({
        field: 'weight',
        message: 'Peso deve estar entre 1 e 500 kg'
      });
    }

    if (validatedData.height <= 0 || validatedData.height > 250) {
      errors.push({
        field: 'height',
        message: 'Altura deve estar entre 1 e 250 cm'
      });
    }

    if (validatedData.age <= 0 || validatedData.age > 120) {
      errors.push({
        field: 'age',
        message: 'Idade deve estar entre 1 e 120 anos'
      });
    }

    if (!gerFormula) {
      errors.push({
        field: 'gerFormula',
        message: 'Selecione uma equação GER'
      });
    }

    // Validações específicas da fórmula GER
    if (gerFormula) {
      const formulaInfo = GER_FORMULAS[gerFormula];
      
      // Fórmulas que requerem % de gordura corporal
      if (formulaInfo.requiresBodyFat && !validatedData.bodyFatPercentage) {
        errors.push({
          field: 'bodyFatPercentage',
          message: `A fórmula ${formulaInfo.name} requer o percentual de gordura corporal`
        });
      }

      // Validação do % de gordura corporal se fornecido
      if (validatedData.bodyFatPercentage) {
        if (validatedData.bodyFatPercentage < 3 || validatedData.bodyFatPercentage > 50) {
          errors.push({
            field: 'bodyFatPercentage',
            message: 'Percentual de gordura deve estar entre 3% e 50%'
          });
        }
      }

      // Avisos específicos por fórmula
      switch (gerFormula) {
        case 'harris_benedict_revisada':
          if (validatedData.weight / Math.pow(validatedData.height / 100, 2) > 30) {
            warnings.push({
              field: 'gerFormula',
              message: 'Para pacientes obesos, considere usar a fórmula Owen'
            });
          }
          break;

        case 'mifflin_st_jeor':
          if (validatedData.age > 65 || validatedData.age < 18) {
            warnings.push({
              field: 'gerFormula',
              message: 'Para menores de 18 ou maiores de 65 anos, considere usar Schofield'
            });
          }
          break;

        case 'owen':
          if (validatedData.weight / Math.pow(validatedData.height / 100, 2) < 25) {
            warnings.push({
              field: 'gerFormula',
              message: 'Para pacientes eutróficos, Mifflin-St Jeor pode ser mais precisa'
            });
          }
          break;

        case 'katch_mcardle':
          if (!validatedData.bodyFatPercentage) {
            warnings.push({
              field: 'bodyFatPercentage',
              message: 'Fórmula Katch-McArdle requer % de gordura para máxima precisão'
            });
          }
          break;

        case 'cunningham':
          if (!validatedData.bodyFatPercentage) {
            warnings.push({
              field: 'bodyFatPercentage',
              message: 'Fórmula Cunningham requer % de gordura para máxima precisão'
            });
          } else if (profile !== 'atleta') {
            warnings.push({
              field: 'gerFormula',
              message: 'Fórmula Cunningham é mais indicada para atletas de elite'
            });
          }
          break;

        case 'schofield':
          if (validatedData.age >= 18 && validatedData.age <= 65) {
            warnings.push({
              field: 'gerFormula',
              message: 'Para adultos saudáveis, Mifflin-St Jeor pode ser mais precisa'
            });
          }
          break;
      }
    }

    // Validações de perfil vs dados
    if (profile === 'atleta' && validatedData.bodyFatPercentage && validatedData.bodyFatPercentage > 20) {
      warnings.push({
        field: 'profile',
        message: 'Percentual de gordura alto para perfil de atleta. Verifique os dados.'
      });
    }

    const isValid = errors.length === 0 && !!gerFormula;

    return { errors, warnings, isValid };
  }, [validatedData, gerFormula, profile]);

  return {
    validatedData,
    errors,
    warnings,
    isValid
  };
};
