import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { usePatient } from '@/contexts/patient/PatientContext';
import { useConsultationData } from '@/contexts/ConsultationDataContext';
import { useMealPlanState } from '@/hooks/useMealPlanState';
import { useMealPlan } from '@/contexts/MealPlanContext';
import { useSaveConsultation } from '@/hooks/useSaveConsultation';
import { useToast } from '@/hooks/use-toast';
import { MealDistributionItem } from '@/types/meal';
import MealPlanGeneratorUI from '@/components/MealPlan/MealPlanGeneratorUI';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

const MealPlanGenerator: React.FC = () => {
  const location = useLocation();
  const { activePatient, setActivePatient } = usePatient();
  const { consultationData, setConsultationData } = useConsultationData();
  const { mealPlan, setMealPlan } = useMealPlan();
  const { handleSaveConsultation } = useSaveConsultation();
  const { saveMealPlan } = useMealPlan();
  const { toast } = useToast();

  // Verificar se viemos da calculadora ENP
  const calculationData = location.state?.calculationData;
  const patientData = location.state?.patientData;
  const systemType = location.state?.systemType;

  // Configurar dados se viemos da calculadora
  useEffect(() => {
    if (calculationData && patientData) {
      // Configurar paciente se não estiver definido
      if (!activePatient && patientData) {
        setActivePatient(patientData);
      }

      // Criar dados de consulta simulados baseados no cálculo ENP
      if (!consultationData) {
        const simulatedConsultationData = {
          id: `enp-${Date.now()}`,
          patient_id: patientData.id,
          objective: calculationData.objective || 'manutenção',
          totalCalories: calculationData.tdee,
          protein: calculationData.protein,
          carbs: calculationData.carbs,
          fats: calculationData.fats,
          results: {
            bmr: calculationData.bmr,
            get: calculationData.tdee,
            vet: calculationData.tdee,
            adjustment: 0,
            macros: {
              protein: calculationData.protein,
              carbs: calculationData.carbs,
              fat: calculationData.fats
            }
          },
          systemType: systemType || 'ENP',
          createdAt: new Date().toISOString()
        };

        setConsultationData(simulatedConsultationData);

        toast({
          title: "Dados ENP carregados",
          description: `Plano alimentar baseado em ${calculationData.tdee} kcal diárias`,
        });
      }
    }
  }, [calculationData, patientData, activePatient, consultationData, setActivePatient, setConsultationData, toast, systemType]);

  // Default meal distribution setup with all required properties
  const defaultMealDistribution: MealDistributionItem[] = [
    { 
      id: '1', 
      name: 'Café da manhã', 
      time: '07:00',
      percent: 25,
      percentage: 25,
      calories: 0, 
      protein: 0, 
      carbs: 0, 
      fat: 0, 
      foods: [],
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFats: 0,
      proteinPercent: 0,
      carbsPercent: 0,
      fatPercent: 0,
      suggestions: []
    },
    { 
      id: '2', 
      name: 'Lanche da manhã', 
      time: '10:00',
      percent: 10,
      percentage: 10,
      calories: 0, 
      protein: 0, 
      carbs: 0, 
      fat: 0, 
      foods: [],
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFats: 0,
      proteinPercent: 0,
      carbsPercent: 0,
      fatPercent: 0,
      suggestions: []
    },
    { 
      id: '3', 
      name: 'Almoço', 
      time: '12:00',
      percent: 30,
      percentage: 30,
      calories: 0, 
      protein: 0, 
      carbs: 0, 
      fat: 0, 
      foods: [],
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFats: 0,
      proteinPercent: 0,
      carbsPercent: 0,
      fatPercent: 0,
      suggestions: []
    },
    { 
      id: '4', 
      name: 'Lanche da tarde', 
      time: '15:00',
      percent: 10,
      percentage: 10,
      calories: 0, 
      protein: 0, 
      carbs: 0, 
      fat: 0, 
      foods: [],
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFats: 0,
      proteinPercent: 0,
      carbsPercent: 0,
      fatPercent: 0,
      suggestions: []
    },
    { 
      id: '5', 
      name: 'Jantar', 
      time: '19:00',
      percent: 20,
      percentage: 20,
      calories: 0, 
      protein: 0, 
      carbs: 0, 
      fat: 0, 
      foods: [],
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFats: 0,
      proteinPercent: 0,
      carbsPercent: 0,
      fatPercent: 0,
      suggestions: []
    },
    { 
      id: '6', 
      name: 'Ceia', 
      time: '22:00',
      percent: 5,
      percentage: 5,
      calories: 0, 
      protein: 0, 
      carbs: 0, 
      fat: 0, 
      foods: [],
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFats: 0,
      proteinPercent: 0,
      carbsPercent: 0,
      fatPercent: 0,
      suggestions: []
    }
  ];

  // Create a wrapper function that matches the expected signature
  const wrappedSaveConsultation = async (data: any) => {
    if (consultationData?.id) {
      return await handleSaveConsultation(consultationData.id, data);
    }
    throw new Error('No consultation ID available');
  };

  const mealPlanStateHook = useMealPlanState();

  // Use the hook properties
  const {
    mealDistribution,
    totalMealPercent,
    isSaving,
    handleMealPercentChange,
    handleSaveMealPlan,
    addMeal,
    removeMeal
  } = mealPlanStateHook;

  if (!activePatient || !consultationData) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="max-w-md text-center space-y-4">
          <h2 className="text-xl font-semibold mb-2">Dados incompletos</h2>
          <p className="text-gray-600 mb-4">
            É necessário selecionar um paciente e ter dados de consulta para gerar o plano alimentar.
          </p>
          
          {systemType === 'ENP' && (
            <Alert className="border-blue-200 bg-blue-50">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-700">
                <strong>Sistema ENP:</strong> Você foi redirecionado da calculadora ENP. 
                Certifique-se de que realizou o cálculo e selecionou um paciente antes de gerar o plano.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    );
  }

  // Ensure patient has required properties for UI
  const patientForUI = {
    name: activePatient.name,
    gender: activePatient.gender || 'other',
    age: activePatient.age
  };

  return (
    <div className="space-y-4">
      {/* Indicador do sistema ENP se aplicável */}
      {systemType === 'ENP' && (
        <Alert className="border-green-200 bg-green-50">
          <Info className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            <strong>Plano ENP:</strong> Este plano alimentar está sendo gerado usando os resultados 
            da Engenharia Nutricional Padrão com distribuição otimizada de 6 refeições.
          </AlertDescription>
        </Alert>
      )}

      <MealPlanGeneratorUI
        activePatient={patientForUI}
        consultationData={consultationData}
        mealDistribution={mealDistribution}
        totalMealPercent={totalMealPercent}
        isSaving={isSaving}
        handleMealPercentChange={handleMealPercentChange}
        handleSaveMealPlan={handleSaveMealPlan}
        handleAddMeal={addMeal}
        handleRemoveMeal={removeMeal}
      />
    </div>
  );
};

export default MealPlanGenerator;
