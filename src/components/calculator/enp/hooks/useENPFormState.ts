
import { useState } from 'react';
import { ActivityLevel, Objective } from '@/types/consultation';

export const useENPFormState = () => {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState<'M' | 'F'>('M');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderado');
  const [objective, setObjective] = useState<Objective>('manutenção');
  
  const resetForm = () => {
    setWeight('');
    setHeight('');
    setAge('');
    setSex('M');
    setActivityLevel('moderado');
    setObjective('manutenção');
  };
  
  return {
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
    resetForm
  };
};
