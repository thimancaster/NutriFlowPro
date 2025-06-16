
/**
 * Form state management for calculator
 */

import { useState, useEffect } from 'react';
import { Profile } from '@/types/consultation';
import { stringToProfile } from '../utils/profileUtils';

export interface CalculatorFormData {
  weight: number;
  height: number;
  age: number;
  sex: 'M' | 'F';
  activityLevel: string;
  objective: string;
  profile: Profile;
  patientName?: string;
}

export const useCalculatorForm = () => {
  const [formData, setFormData] = useState<CalculatorFormData>({
    weight: 65,
    height: 160,
    age: 49,
    sex: 'F',
    activityLevel: 'moderado',
    objective: 'emagrecimento',
    profile: 'eutrofico'
  });

  // Load saved state
  useEffect(() => {
    const savedState = localStorage.getItem('calculatorState');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setFormData(prev => ({
          ...prev,
          ...parsed,
          profile: stringToProfile(parsed.profile)
        }));
      } catch (error) {
        console.error('Error loading saved state:', error);
      }
    }
  }, []);

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem('calculatorState', JSON.stringify(formData));
  }, [formData]);

  const handleInputChange = (field: keyof CalculatorFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProfileChange = (profile: Profile) => {
    setFormData(prev => ({
      ...prev,
      profile
    }));
  };

  const resetForm = () => {
    setFormData({
      weight: 65,
      height: 160,
      age: 49,
      sex: 'F',
      activityLevel: 'moderado',
      objective: 'emagrecimento',
      profile: 'eutrofico'
    });
    localStorage.removeItem('calculatorState');
  };

  return {
    formData,
    handleInputChange,
    handleProfileChange,
    resetForm,
    // Individual field accessors for compatibility
    weight: formData.weight,
    height: formData.height,
    age: formData.age,
    sex: formData.sex,
    activityLevel: formData.activityLevel,
    objective: formData.objective,
    profile: formData.profile,
    patientName: formData.patientName
  };
};
