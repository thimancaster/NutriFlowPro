
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { FileText, Home, Calculator, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DEFAULT_MEAL_DISTRIBUTION, MEAL_NAMES, calculateMealDistribution } from '@/utils/mealPlanUtils';
import PatientHeader from '@/components/Anthropometry/PatientHeader';
import ConsultationHeader from '@/components/ConsultationHeader';
import MealPlanActions from '@/components/MealPlanActions';
import { useConsultation } from '@/contexts/ConsultationContext';
import { MealDistributionItem, MealPlan } from '@/types';
import { BackButton } from '@/components/ui/back-button';

interface MealDistribution {
  [key: string]: MealDistributionItem;
}

const MealPlanGenerator = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { activePatient, consultationData, mealPlan, setMealPlan, saveMealPlan, saveConsultation } = useConsultation();
  
  // Ensure we have the data
  useEffect(() => {
    if (!consultationData) {
      toast({
        title: "Dados insuficientes",
        description: "Por favor, complete uma consulta ou cálculo nutricional primeiro.",
        variant: "destructive",
      });
      navigate('/consultation');
    }
  }, [consultationData, navigate, toast]);

  const [totalMealPercent, setTotalMealPercent] = useState(100);
  const [isSaving, setIsSaving] = useState(false);
  
  // Initial meal distribution based on our utility
  const initialDistribution: MealDistribution = {};
  DEFAULT_MEAL_DISTRIBUTION.forEach((percent, index) => {
    initialDistribution[`meal${index + 1}`] = {
      name: MEAL_NAMES[index],
      percent: percent * 100,
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      suggestions: [],
    };
  });

  const [mealDistribution, setMealDistribution] = useState<MealDistribution>(
    mealPlan && mealPlan.mealDistribution ? mealPlan.mealDistribution : initialDistribution
  );

  // Calculate meal macros when distribution percentages or total macros change
  useEffect(() => {
    if (!consultationData) return;
    
    const distributionArray = Object.keys(mealDistribution).map(
      mealKey => mealDistribution[mealKey].percent / 100
    );
    
    const { meals, totalCalories, totalProtein, totalCarbs, totalFats } = calculateMealDistribution(
      consultationData.results.get, 
      consultationData.objective,
      distributionArray
    );
    
    const updatedDistribution = { ...mealDistribution };
    
    meals.forEach((meal, index) => {
      const mealKey = `meal${index + 1}`;
      updatedDistribution[mealKey] = {
        ...updatedDistribution[mealKey],
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.cho,
        fat: meal.fat,
        suggestions: meal.foodSuggestions
      };
    });
    
    setMealDistribution(updatedDistribution);
    
    // Update the meal plan in the context
    const newMealPlan: MealPlan = {
      meals: Object.values(updatedDistribution),
      mealDistribution: updatedDistribution,
      total_calories: totalCalories,
      total_protein: totalProtein,
      total_carbs: totalCarbs,
      total_fats: totalFats,
      patient_id: activePatient?.id,
      date: new Date().toISOString().split('T')[0]
    };
    
    setMealPlan(newMealPlan);
    
  }, [consultationData, setMealPlan, activePatient]);

  // Update a specific meal's percentage
  const handleMealPercentChange = (mealKey: string, newValue: number[]) => {
    const newPercent = newValue[0];
    
    setMealDistribution(prev => {
      const prevPercent = prev[mealKey].percent;
      const diff = newPercent - prevPercent;
      
      // Don't allow changes that would make total percent go over/under 100%
      if (totalMealPercent + diff !== 100) {
        return prev;
      }
      
      // Create updated distribution
      const updatedDistribution = {
        ...prev,
        [mealKey]: {
          ...prev[mealKey],
          percent: newValue[0]
        }
      };
      
      // Get array of percentages for recalculating
      const distributionArray = Object.keys(updatedDistribution).map(
        key => updatedDistribution[key].percent / 100
      );
      
      if (!consultationData) return prev;
      
      // Recalculate macros for all meals
      const { meals } = calculateMealDistribution(
        consultationData.results.get, 
        consultationData.objective,
        distributionArray
      );
      
      // Update all meal values
      meals.forEach((meal, index) => {
        const currMealKey = `meal${index + 1}`;
        updatedDistribution[currMealKey] = {
          ...updatedDistribution[currMealKey],
          calories: meal.calories,
          protein: meal.protein,
          carbs: meal.cho,
          fat: meal.fat,
          suggestions: meal.foodSuggestions
        };
      });
      
      return updatedDistribution;
    });
    
    // Update total percentage
    setTotalMealPercent(prev => prev + (newValue[0] - mealDistribution[mealKey].percent));
  };

  const handleSaveMealPlan = async () => {
    setIsSaving(true);
    try {
      // First save the consultation data
      await saveConsultation();
      
      // Then save the meal plan
      await saveMealPlan();
      
      toast({
        title: "Plano alimentar salvo",
        description: "O plano alimentar foi salvo com sucesso."
      });
      
      // Navigate to patient history if we have a patient
      if (activePatient?.id) {
        navigate(`/patient-history/${activePatient.id}`);
      } else {
        navigate('/meal-plans');
      }
    } catch (error) {
      console.error("Error saving meal plan:", error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar o plano alimentar.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!consultationData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-xl font-medium mb-2">Carregando dados da consulta...</h2>
            <p className="text-gray-600">Aguarde enquanto processamos os dados.</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <ConsultationHeader currentStep="meal-plan" />
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center mb-4 text-sm text-gray-600">
          <Link to="/" className="flex items-center hover:text-nutri-blue transition-colors">
            <Home className="h-4 w-4 mr-1" />
            <span>Início</span>
          </Link>
          <ChevronRight className="h-3 w-3 mx-2" />
          <Link to="/consultation" className="flex items-center hover:text-nutri-blue transition-colors">
            <Calculator className="h-4 w-4 mr-1" />
            <span>Consulta</span>
          </Link>
          <ChevronRight className="h-3 w-3 mx-2" />
          <span className="font-medium text-nutri-blue">Plano Alimentar</span>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start mb-8">
          <div>
            <BackButton to="/consultation" label="Voltar para Consulta" />
            <h1 className="text-3xl font-bold text-nutri-blue mt-4 mb-2">Plano Alimentar</h1>
            <p className="text-gray-600">
              Distribua as calorias e macronutrientes entre as refeições
            </p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <MealPlanActions onSave={handleSaveMealPlan} />
          </div>
        </div>
        
        {activePatient && (
          <PatientHeader 
            patientName={activePatient.name}
            patientAge={consultationData.age ? parseInt(consultationData.age) : undefined}
            patientGender={activePatient.gender}
            patientObjective={consultationData.objective}
          />
        )}
        
        <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-nutri-gray-light rounded-lg p-3 text-center">
              <p className="text-sm text-gray-500 mb-1">Total Calorias</p>
              <p className="text-xl font-bold text-nutri-blue">{consultationData.results.get} kcal</p>
            </div>
            <div className="bg-nutri-gray-light rounded-lg p-3 text-center">
              <p className="text-sm text-gray-500 mb-1">Proteínas</p>
              <p className="text-xl font-bold text-nutri-blue">{consultationData.results.macros.protein}g</p>
            </div>
            <div className="bg-nutri-gray-light rounded-lg p-3 text-center">
              <p className="text-sm text-gray-500 mb-1">Carboidratos</p>
              <p className="text-xl font-bold text-nutri-green">{consultationData.results.macros.carbs}g</p>
            </div>
            <div className="bg-nutri-gray-light rounded-lg p-3 text-center">
              <p className="text-sm text-gray-500 mb-1">Gorduras</p>
              <p className="text-xl font-bold text-amber-500">{consultationData.results.macros.fat}g</p>
            </div>
          </div>
        </div>
        
        <p className="text-sm mb-1">
          Distribuição total: <span className={totalMealPercent === 100 ? "text-green-600" : "text-red-600"}>
            {totalMealPercent}%
          </span>
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.keys(mealDistribution).map((mealKey) => {
            const meal = mealDistribution[mealKey];
            
            return (
              <Card 
                key={mealKey}
                className="nutri-card shadow-md border-none hover:shadow-lg transition-shadow"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex justify-between">
                    {meal.name}
                    <span className="text-nutri-blue font-medium">{meal.percent}%</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Ajustar percentual</span>
                      </div>
                      <Slider 
                        value={[meal.percent]} 
                        min={0} 
                        max={100}
                        step={1}
                        onValueChange={(value) => handleMealPercentChange(mealKey, value)}
                      />
                    </div>
                    
                    <div className="pt-2 border-t border-gray-100">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Calorias:</span>
                        <span className="font-medium">{meal.calories} kcal</span>
                      </div>
                      
                      <div className="space-y-2 mt-3">
                        <div className="flex justify-between text-xs">
                          <span>Proteínas</span>
                          <span>{meal.protein}g</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-nutri-blue h-1.5 rounded-full" 
                            style={{ width: `${(meal.protein * 4 * 100) / (meal.calories || 1)}%` }}
                          ></div>
                        </div>
                        
                        <div className="flex justify-between text-xs">
                          <span>Carboidratos</span>
                          <span>{meal.carbs}g</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-nutri-green h-1.5 rounded-full" 
                            style={{ width: `${(meal.carbs * 4 * 100) / (meal.calories || 1)}%` }}
                          ></div>
                        </div>
                        
                        <div className="flex justify-between text-xs">
                          <span>Gorduras</span>
                          <span>{meal.fat}g</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-amber-500 h-1.5 rounded-full" 
                            style={{ width: `${(meal.fat * 9 * 100) / (meal.calories || 1)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-sm font-medium mb-2">Sugestões de alimentos:</p>
                      <ul className="text-sm space-y-1">
                        {meal.suggestions?.map((suggestion, idx) => (
                          <li key={idx} className="text-gray-600">• {suggestion}</li>
                        )) || <li className="text-gray-500">Nenhuma sugestão disponível</li>}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        <div className="mt-8 flex justify-between">
          <BackButton to="/consultation" variant="outline" />
          <Button 
            onClick={handleSaveMealPlan}
            className="bg-nutri-green hover:bg-nutri-green-dark"
            disabled={isSaving}
          >
            {isSaving ? "Salvando..." : "Salvar e Finalizar Plano"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MealPlanGenerator;
