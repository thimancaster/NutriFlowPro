
import { useQuery } from '@tanstack/react-query';
import { MealPlanService } from '@/services/mealPlanService';
import { useAuth } from '@/contexts/auth/AuthContext';

export const useMealPlans = (patientId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['meal-plans', user?.id, patientId],
    queryFn: async () => {
      if (!user?.id) return { success: false, data: [] };
      
      const filters: any = {};
      if (patientId) {
        filters.patient_id = patientId;
      }
      
      const result = await MealPlanService.getMealPlans(user.id, filters);
      return result;
    },
    enabled: !!user?.id
  });
};
