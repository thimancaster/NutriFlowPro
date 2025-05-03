
import { Json } from '@/integrations/supabase/types';

// Helper function to safely extract objective from goals
export const getObjectiveFromGoals = (goals: Json | null): string => {
  if (!goals) return 'manutenção';
  
  if (typeof goals === 'object' && goals !== null && 'objective' in goals) {
    const objective = goals.objective;
    if (typeof objective === 'string') {
      return objective;
    }
  }
  
  return 'manutenção';
};

// Calculate patient age from birthdate
export const calculateAge = (birthDate: string | null | undefined): number | undefined => {
  if (!birthDate) return undefined;
  
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};
