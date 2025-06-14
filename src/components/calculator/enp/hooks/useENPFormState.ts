
import { useState } from 'react';
import { ActivityLevel, Objective, Profile } from '@/types/consultation';
import { GERFormula } from '@/types/gerFormulas';

export const useENPFormState = () => {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState<'M' | 'F'>('M');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderado');
  const [objective, setObjective] = useState<Objective>('manutenção');
  
  const [profile, setProfile] = useState<Profile>('eutrofico');
  const [gerFormula, setGERFormula] = useState<GERFormula | undefined>(undefined);
  const [bodyFatPercentage, setBodyFatPercentage] = useState('');

  const resetForm = () => {
    setWeight('');
    setHeight('');
    setAge('');
    setSex('M');
    setActivityLevel('moderado');
    setObjective('manutenção');
    setProfile('eutrofico');
    setGERFormula(undefined);
    setBodyFatPercentage('');
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
    profile,
    setProfile,
    gerFormula,
    setGERFormula,
    bodyFatPercentage,
    setBodyFatPercentage,
    resetForm
  };
};
