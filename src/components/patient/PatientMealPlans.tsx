
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { PlusCircle, FileText } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface PatientMealPlansProps {
  patientId: string;
}

interface MealPlan {
  id: string;
  date: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
}

const PatientMealPlans = ({ patientId }: PatientMealPlansProps) => {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchMealPlans = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('meal_plans')
          .select('id, date, total_calories, total_protein, total_carbs, total_fats')
          .eq('patient_id', patientId)
          .order('date', { ascending: false });
        
        if (error) throw error;
        setMealPlans(data || []);
      } catch (error) {
        console.error('Error fetching meal plans:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMealPlans();
  }, [patientId]);
  
  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'dd/MM/yyyy');
    } catch (e) {
      return dateStr;
    }
  };
  
  const handleNewMealPlan = () => {
    navigate(`/meal-plan-generator?patientId=${patientId}`);
  };
  
  const handleViewMealPlan = (planId: string) => {
    // Navigate to meal plan detail view
    navigate(`/meal-plans/${planId}`);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nutri-blue"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Planos Alimentares</h3>
        <Button 
          onClick={handleNewMealPlan}
          className="bg-nutri-green hover:bg-green-700"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Novo Plano
        </Button>
      </div>
      
      {mealPlans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mealPlans.map((plan) => (
            <div 
              key={plan.id} 
              className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
              onClick={() => handleViewMealPlan(plan.id)}
            >
              <div className="flex justify-between items-center mb-3">
                <span className="font-medium">{formatDate(plan.date)}</span>
                <FileText className="h-4 w-4 text-gray-500" />
              </div>
              
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Calorias:</span> {plan.total_calories} kcal</p>
                <p><span className="font-medium">Proteínas:</span> {plan.total_protein}g</p>
                <p><span className="font-medium">Carboidratos:</span> {plan.total_carbs}g</p>
                <p><span className="font-medium">Gorduras:</span> {plan.total_fats}g</p>
              </div>
              
              <div className="mt-3 text-right">
                <span className="text-nutri-blue text-sm">Ver detalhes →</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 italic">Nenhum plano alimentar registrado.</p>
      )}
    </div>
  );
};

export default PatientMealPlans;
