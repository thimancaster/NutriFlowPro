import { useState, useCallback, useMemo } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  calculateComplete_Official,
  CalculationInputs,
  CalculationResult,
  AVAILABLE_FORMULAS,
} from '@/utils/nutrition/official/officialCalculations';
import { Patient } from '@/types';

// Define o esquema de validação para o formulário da calculadora
const calculatorSchema = z.object({
  weight: z.number().min(1, 'Peso é obrigatório'),
  height: z.number().min(1, 'Altura é obrigatória'),
  age: z.number().min(1, 'Idade é obrigatória'),
  sex: z.enum(['M', 'F'], { required_error: 'Sexo é obrigatório' }),
  formula: z.string().min(1, 'Fórmula é obrigatória'),
  activityLevel: z.string().min(1, 'Nível de atividade é obrigatório'),
  objective: z.string().min(1, 'Objetivo é obrigatório'),
  proteinPerKg: z.number().min(0.1, 'Proteína g/kg é obrigatória'),
  fatPerKg: z.number().min(0.1, 'Gordura g/kg é obrigatória'),
});

// Extrai o tipo dos dados do formulário a partir do esquema Zod
export type OfficialCalculatorFormData = z.infer<typeof calculatorSchema>;

/**
 * Hook customizado para gerenciar toda a lógica da Calculadora Nutricional Oficial.
 * Ele lida com o estado do formulário, a execução dos cálculos e os resultados.
 */
export function useOfficialCalculations() {
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Inicializa o formulário com 'react-hook-form' e validação Zod
  const form: UseFormReturn<OfficialCalculatorFormData> = useForm<OfficialCalculatorFormData>({
    resolver: zodResolver(calculatorSchema),
    defaultValues: {
      weight: 0,
      height: 0,
      age: 0,
      proteinPerKg: 0,
      fatPerKg: 0,
    },
  });

  /**
   * Função para executar o pipeline completo de cálculo.
   * É chamada quando o formulário é submetido.
   */
  const runCalculation = useCallback((formData: OfficialCalculatorFormData) => {
    setError(null);
    try {
      // Mapeia os dados do formulário para o formato esperado pelo motor de cálculo
      const calculationInputs: CalculationInputs = {
        weight: formData.weight,
        height: formData.height,
        age: formData.age,
        gender: formData.sex,
        formula: formData.formula as CalculationInputs['formula'],
        activityLevel: formData.activityLevel as CalculationInputs['activityLevel'],
        objective: formData.objective as CalculationInputs['objective'],
        macroInputs: {
          proteinPerKg: formData.proteinPerKg,
          fatPerKg: formData.fatPerKg,
        },
      };

      const result = calculateComplete_Official(calculationInputs);
      setCalculationResult(result);
    } catch (e: any) {
      setError(e.message || 'Ocorreu um erro ao realizar o cálculo.');
      setCalculationResult(null);
      console.error('Calculation Error:', e);
    }
  }, []);

  /**
   * Limpa os resultados e reseta o formulário para um novo cálculo.
   */
  const resetCalculator = useCallback(() => {
    form.reset();
    setCalculationResult(null);
    setError(null);
  }, [form]);

  /**
   * Pré-preenche o formulário com dados de um paciente selecionado.
   */
  const loadPatientData = useCallback(
    (patient: Patient) => {
      const age = patient.birthDate
        ? new Date().getFullYear() - new Date(patient.birthDate).getFullYear()
        : 0;
      form.setValue('sex', patient.sex);
      form.setValue('age', age);
      // Futuramente, pode-se pré-preencher peso e altura da última consulta
    },
    [form]
  );

  // Expõe as fórmulas disponíveis para serem usadas na UI (ex: no seletor)
  const availableFormulas = useMemo(() => AVAILABLE_FORMULAS, []);

  return {
    form,
    runCalculation,
    calculationResult,
    error,
    resetCalculator,
    loadPatientData,
    availableFormulas,
  };
}
