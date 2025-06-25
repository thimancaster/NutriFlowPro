
import { useState } from 'react';
import { Profile } from '@/types/consultation';
import { stringToProfile } from '../utils/profileUtils';

export const useCalculatorForm = () => {
  const [formData, setFormData] = useState({
    weight: '',
    height: '',
    age: '',
    sex: 'F' as 'M' | 'F',
    activityLevel: 'moderado',
    objective: 'manutenção',
    profile: 'eutrofico' as Profile,
    patientName: ''
  });

  const handleInputChange = (name: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileChange = (value: string) => {
    const profile = stringToProfile(value);
    setFormData(prev => ({
      ...prev,
      profile
    }));
  };

  const resetForm = () => {
    setFormData({
      weight: '',
      height: '',
      age: '',
      sex: 'F',
      activityLevel: 'moderado',
      objective: 'manutenção',
      profile: 'eutrofico',
      patientName: ''
    });
  };

  return {
    formData,
    handleInputChange,
    handleProfileChange,
    resetForm,
    // Individual getters for backward compatibility
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
