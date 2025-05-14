
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { calculateBMR, calculateTEE, calculateMacros } from '@/components/calculator/utils/calculations';
import { saveCalculatorResults } from '@/components/calculator/storageUtils';
import { ConsultationData } from '@/types';
import { UseCalculationLogicProps } from '@/components/calculator/types';

export const useCalculationLogic = ({
  setBmr,
  setTee,
  setMacros,
  setConsultationData,
  toast,
  user,
  tempPatientId,
  setTempPatientId
}: UseCalculationLogicProps) => {
  const [isCalculating, setIsCalculating] = useState(false);

  const performCalculation = useCallback(async (calculatorState) => {
    setIsCalculating(true);
    
    try {
      const {
        patientName,
        gender,
        age,
        weight,
        height,
        objective,
        activityLevel,
        carbsPercentage,
        proteinPercentage,
        fatPercentage,
        profile,
        consultationType
      } = calculatorState;
      
      // Make sure required fields are filled
      if (!patientName || !age || !weight || !height) {
        toast({
          title: "Dados incompletos",
          description: "Preencha todos os campos obrigatórios",
          variant: "destructive"
        });
        return;
      }
      
      // Calculate BMR (Basal Metabolic Rate)
      const calculatedBmr = calculateBMR(gender, weight, height, age);
      setBmr(calculatedBmr);
      
      // Calculate TEE (Total Energy Expenditure)
      const { get, adjustment, vet } = calculateTEE(calculatedBmr, activityLevel, objective);
      setTee(vet);
      
      // Calculate macronutrients distribution
      const calculatedMacros = calculateMacros(
        vet,
        carbsPercentage,
        proteinPercentage,
        fatPercentage,
        parseFloat(weight)
      );
      setMacros(calculatedMacros);
      
      // Generate a temporary patient ID if not exists
      const patientTempId = tempPatientId || uuidv4();
      if (!tempPatientId) {
        setTempPatientId(patientTempId);
      }
      
      // Save results to localStorage for persistence
      saveCalculatorResults(calculatedBmr, vet, calculatedMacros, patientTempId);
      
      // If we have consultation data context, update it
      if (setConsultationData && user) {
        const consultationData: ConsultationData = {
          id: uuidv4(),
          user_id: user.id,
          patient_id: patientTempId,
          patient: {
            id: patientTempId,
            name: patientName,
            gender: gender === 'male' ? 'M' : 'F',
            age: parseInt(age)
          },
          weight: parseFloat(weight),
          height: parseFloat(height),
          objective,
          activityLevel,
          gender,
          created_at: new Date().toISOString(),
          tipo: consultationType,
          results: {
            bmr: calculatedBmr,
            get,
            adjustment,
            vet,
            macros: {
              ...calculatedMacros,
              proteinPerKg: calculatedMacros.proteinPerKg || 0
            }
          }
        };
        
        setConsultationData(consultationData);
        
        toast({
          title: "Cálculo concluído",
          description: "Os resultados foram calculados com sucesso."
        });
      } else {
        toast({
          title: "Cálculo concluído",
          description: "Os resultados foram calculados, mas a consulta não foi salva."
        });
      }
    } catch (error: any) {
      console.error("Erro ao calcular:", error);
      toast({
        title: "Erro no cálculo",
        description: error.message || "Ocorreu um erro ao calcular os resultados.",
        variant: "destructive"
      });
    } finally {
      setIsCalculating(false);
    }
  }, [setBmr, setTee, setMacros, setConsultationData, toast, user, tempPatientId, setTempPatientId]);

  return {
    isCalculating,
    performCalculation
  };
};
