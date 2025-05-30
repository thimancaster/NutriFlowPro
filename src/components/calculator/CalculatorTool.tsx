
import React from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { usePatient } from '@/contexts/patient/PatientContext';
import CalculatorInputs from './CalculatorInputs';
import CalculatorResults from './CalculatorResults';
import CalculatorActions from './CalculatorActions';
import { useCalculator } from '@/hooks/useCalculator';
import { Card, CardContent } from '@/components/ui/card';

const CalculatorTool: React.FC = () => {
  const { user } = useAuth();
  const { activePatient } = usePatient();
  
  const calculator = useCalculator();

  const handleCalculate = async () => {
    await calculator.performCalculation();
  };

  const handleSavePatient = async () => {
    if (!user || !calculator.patientName) return;
    
    // Aqui você pode implementar a lógica de salvar paciente
    console.log('Saving patient...');
  };

  const handleGenerateMealPlan = async () => {
    if (!user || !activePatient) return;
    
    await calculator.generateMealPlan(user.id, activePatient.id);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inputs do Calculador */}
        <div className="space-y-6">
          <CalculatorInputs
            patientName={calculator.patientName}
            setPatientName={calculator.setPatientName}
            gender={calculator.gender}
            setGender={calculator.setGender}
            age={calculator.age}
            setAge={calculator.setAge}
            weight={calculator.weight}
            setWeight={calculator.setWeight}
            height={calculator.height}
            setHeight={calculator.setHeight}
            objective={calculator.objective}
            setObjective={calculator.setObjective}
            activityLevel={calculator.activityLevel}
            setActivityLevel={calculator.setActivityLevel}
            consultationType={calculator.consultationType}
            setConsultationType={calculator.setConsultationType}
            profile={calculator.profile}
            setProfile={calculator.setProfile}
            user={user}
            activePatient={activePatient}
          />
          
          {/* Botão Calcular */}
          <Card>
            <CardContent className="pt-6">
              <CalculatorActions
                isCalculating={calculator.isCalculating}
                calculateResults={handleCalculate}
              />
            </CardContent>
          </Card>
        </div>

        {/* Resultados do Calculador */}
        <CalculatorResults
          bmr={calculator.results?.tmb || 0}
          tee={{
            get: calculator.results?.get || 0,
            vet: calculator.results?.vet || 0,
            adjustment: calculator.results?.adjustment || 0
          }}
          macros={calculator.results?.macros || null}
          carbsPercentage={calculator.carbsPercentage}
          proteinPercentage={calculator.proteinPercentage}
          fatPercentage={calculator.fatPercentage}
          handleSavePatient={handleSavePatient}
          handleGenerateMealPlan={handleGenerateMealPlan}
          isSavingPatient={calculator.isSaving}
          hasPatientName={!!calculator.patientName}
          user={user}
          weight={parseFloat(calculator.weight) || 0}
          height={parseFloat(calculator.height) || 0}
          age={parseFloat(calculator.age) || 0}
          sex={calculator.gender === 'male' ? 'M' : 'F'}
        />
      </div>
    </div>
  );
};

export default CalculatorTool;
