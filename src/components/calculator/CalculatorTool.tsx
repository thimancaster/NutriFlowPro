
import React, { useState } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import CalculatorInputs from './CalculatorInputs';
import CalculatorResults from './CalculatorResults';
import { useCalculatorForm } from './hooks/useCalculatorForm';
import { useCalculatorResults } from './hooks/useCalculatorResults';
import { Patient } from '@/types';
import PatientDataHandler from './components/PatientDataHandler';

const CalculatorTool: React.FC = () => {
  const { user } = useAuth();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [tempPatientId, setTempPatientId] = useState<string | null>(null);

  // Estados do formulário
  const {
    patientName,
    setPatientName,
    gender,
    setGender,
    age,
    setAge,
    weight,
    setWeight,
    height,
    setHeight,
    objective,
    setObjective,
    activityLevel,
    setActivityLevel,
    consultationType,
    setConsultationType,
    profile,
    setProfile
  } = useCalculatorForm();

  // Estados dos resultados - usando useState simples
  const [bmr, setBmr] = useState<number>(0);
  const [tee, setTee] = useState<{ get: number; vet: number; adjustment: number }>({ get: 0, vet: 0, adjustment: 0 });
  const [macros, setMacros] = useState<any>(null);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <PatientDataHandler
        selectedPatient={selectedPatient}
        patientName={patientName}
        setPatientName={setPatientName}
        weight={weight}
        setWeight={setWeight}
        height={height}
        setHeight={setHeight}
        age={age}
        setAge={setAge}
        gender={gender}
        setGender={setGender}
        activityLevel={activityLevel}
        setActivityLevel={setActivityLevel}
        objective={objective}
        setObjective={setObjective}
        consultationType={consultationType}
        setConsultationType={setConsultationType}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Inputs do Calculador */}
          <CalculatorInputs
            patientName={patientName}
            setPatientName={setPatientName}
            gender={gender}
            setGender={setGender}
            age={age}
            setAge={setAge}
            weight={weight}
            setWeight={setWeight}
            height={height}
            setHeight={setHeight}
            objective={objective}
            setObjective={setObjective}
            activityLevel={activityLevel}
            setActivityLevel={setActivityLevel}
            consultationType={consultationType}
            setConsultationType={setConsultationType}
            profile={profile}
            setProfile={setProfile}
            user={user}
            activePatient={selectedPatient}
          />

          {/* Resultados do Calculador */}
          <CalculatorResults
            bmr={bmr}
            tee={tee}
            macros={macros}
            user={user}
          />
        </div>
      </PatientDataHandler>
    </div>
  );
};

export default CalculatorTool;
