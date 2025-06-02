
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth/AuthContext';
import { usePatient } from '@/contexts/patient/PatientContext';
import { useCalculator } from '@/hooks/useCalculator';
import { ActivityLevel, Objective } from '@/types/consultation';

export const useENPCalculatorLogic = () => {
  // Estados para os 6 campos obrigatórios ENP
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState<'M' | 'F'>('M');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderado');
  const [objective, setObjective] = useState<Objective>('manutenção');
  
  const calculator = useCalculator();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { activePatient } = usePatient();
  
  // Validação ENP
  const validateData = useCallback(() => {
    return {
      weight: parseFloat(weight) || 0,
      height: parseFloat(height) || 0,
      age: parseFloat(age) || 0,
      sex,
      activityLevel,
      objective
    };
  }, [weight, height, age, sex, activityLevel, objective]);
  
  const data = validateData();
  const isValid = data.weight > 0 && data.height > 0 && data.age > 0;
  
  const handleCalculate = useCallback(async () => {
    if (!isValid) return;
    
    try {
      const result = await calculator.calculate(
        data.weight,
        data.height,
        data.age,
        data.sex,
        data.activityLevel,
        data.objective,
        'eutrofico' // Profile padrão - será ajustado pelo nutricionista se necessário
      );
      
      // Callback is handled by the calculator internally
    } catch (error) {
      console.error('Erro no cálculo ENP:', error);
    }
  }, [isValid, calculator, data]);

  const handleExportResults = useCallback(() => {
    if (!calculator.results) {
      toast({
        title: "Nenhum resultado",
        description: "Realize o cálculo ENP primeiro para exportar os resultados.",
        variant: "destructive"
      });
      return;
    }

    // Funcionalidade de exportação padrão
    const exportData = {
      system: 'ENP - Engenharia Nutricional Padrão',
      timestamp: new Date().toISOString(),
      patient: { 
        name: activePatient?.name || 'Paciente',
        weight: data.weight, 
        height: data.height, 
        age: data.age, 
        sex: data.sex 
      },
      parameters: { activityLevel: data.activityLevel, objective: data.objective },
      results: calculator.results,
      professional: user?.email || 'Nutricionista'
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `enp-calculo-${activePatient?.name || 'paciente'}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Exportação concluída",
      description: "Resultados ENP exportados com sucesso.",
    });
  }, [calculator.results, data, activePatient, user, toast]);

  return {
    // Form state
    weight,
    setWeight,
    height,
    setHeight,
    age,
    setAge,
    sex,
    setSex,
    activityLevel,
    setActivityLevel,
    objective,
    setObjective,
    
    // Validation
    validatedData: data,
    isValid,
    
    // Actions
    handleCalculate,
    handleExportResults,
    
    // Calculator state
    isCalculating: calculator.isCalculating,
    error: calculator.error,
    results: calculator.results
  };
};
