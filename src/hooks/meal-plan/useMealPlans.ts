
import { useQuery } from '@tanstack/react-query';
import { MealPlanService } from '@/services/mealPlanService';
import { useAuth } from '@/contexts/auth/AuthContext';

export const useMealPlans = (patientId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['meal-plans', user?.id, patientId],
    queryFn: async () => {
      if (!user?.id) return { success: false, data: [] };
      
      const result = await MealPlanService.getMealPlans(user.id, patientId ? { patient_id: patientId } : undefined);
      return result;
    },
    enabled: !!user?.id
  });
};
