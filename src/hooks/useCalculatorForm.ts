
import { useState, useEffect } from 'react';
import { Profile } from '@/types/consultation';

interface CalculatorFormState {
  // Dados básicos
  weight: string;
  height: string;
  age: string;
  sex: 'M' | 'F';
  
  // Configurações avançadas
  activityLevel: string;
  objective: string;
  profile: Profile;
  
  // Estados da UI
  activeTab: 'basic' | 'advanced' | 'results';
}

const initialState: CalculatorFormState = {
  weight: '',
  height: '',
  age: '',
  sex: 'F',
  activityLevel: 'moderado',
  objective: 'manutenção',
  profile: 'eutrofico',
  activeTab: 'basic'
};

export const useCalculatorForm = () => {
  const [formState, setFormState] = useState<CalculatorFormState>(initialState);

  // Carregar estado salvo do localStorage
  useEffect(() => {
    try {
      const savedState = localStorage.getItem('calculatorFormState');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        setFormState(prevState => ({ ...prevState, ...parsedState }));
      }
    } catch (error) {
      console.error('Erro ao carregar estado da calculadora:', error);
    }
  }, []);

  // Salvar estado no localStorage quando mudanças
  useEffect(() => {
    try {
      const stateToSave = {
        weight: formState.weight,
        height: formState.height,
        age: formState.age,
        sex: formState.sex,
        activityLevel: formState.activityLevel,
        objective: formState.objective,
        profile: formState.profile
      };
      localStorage.setItem('calculatorFormState', JSON.stringify(stateToSave));
    } catch (error) {
      console.error('Erro ao salvar estado da calculadora:', error);
    }
  }, [formState]);

  const updateField = <K extends keyof CalculatorFormState>(
    field: K,
    value: CalculatorFormState[K]
  ) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  const setActiveTab = (tab: 'basic' | 'advanced' | 'results') => {
    updateField('activeTab', tab);
  };

  const resetForm = () => {
    setFormState(initialState);
    localStorage.removeItem('calculatorFormState');
  };

  const populateFromPatient = (patientData: any) => {
    if (patientData) {
      setFormState(prev => ({
        ...prev,
        weight: patientData.weight?.toString() || '',
        height: patientData.height?.toString() || '',
        age: patientData.age?.toString() || '',
        sex: patientData.gender === 'male' ? 'M' : 'F'
      }));
    }
  };

  // Validação do formulário
  const isFormValid = (): boolean => {
    const weight = parseFloat(formState.weight);
    const height = parseFloat(formState.height);
    const age = parseFloat(formState.age);

    return !isNaN(weight) && weight > 0 &&
           !isNaN(height) && height > 0 &&
           !isNaN(age) && age > 0;
  };

  return {
    formState,
    updateField,
    setActiveTab,
    resetForm,
    populateFromPatient,
    isFormValid
  };
};
