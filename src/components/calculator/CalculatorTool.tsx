
import React, { useState } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { CalculatorInputs } from './CalculatorInputs';
import { CalculatorResults } from './CalculatorResults';
import { useCalculatorState } from './hooks/useCalculatorState';
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

  // Estados dos resultados
  const {
    bmr,
    setBmr,
    tee,
    setTee,
    macros,
    setMacros
  } = useCalculatorResults({
    setBmr: (value: number) => setBmr(value),
    setTee: (value: number) => setTee(value),
    setMacros: (value: any) => setMacros(value),
    toast: { toast: () => {}, dismiss: () => {} },
    user,
    tempPatientId,
    setTempPatientId
  });

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
            tee={{ get: tee, vet: tee, adjustment: 0 }}
            macros={macros}
            user={user}
          />
        </div>
      </PatientDataHandler>
    </div>
  );
};

export default CalculatorTool;
