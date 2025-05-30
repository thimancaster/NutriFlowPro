
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalculatorInputsProps } from './types';
import PatientBasicInfo from './inputs/PatientBasicInfo';
import AnthropometryInputs from './inputs/AnthropometryInputs';
import ProfileSelectionInputs from './inputs/ProfileSelectionInputs';

const CalculatorInputs: React.FC<CalculatorInputsProps> = ({
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
  setProfile,
  user,
  activePatient
}) => {
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados do Paciente</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <PatientBasicInfo
          patientName={patientName}
          setPatientName={setPatientName}
          gender={gender}
          setGender={setGender}
          age={age}
          setAge={setAge}
        />
        
        <AnthropometryInputs
          weight={weight}
          setWeight={setWeight}
          height={height}
          setHeight={setHeight}
        />
        
        <ProfileSelectionInputs
          profile={profile}
          setProfile={setProfile}
          activityLevel={activityLevel}
          setActivityLevel={setActivityLevel}
          objective={objective}
          setObjective={setObjective}
          consultationType={consultationType}
          setConsultationType={setConsultationType}
        />
        
        <div className="text-xs text-gray-500">
          <span className="text-red-500">*</span> Campos obrigatórios
        </div>
      </CardContent>
    </Card>
  );
};

export default CalculatorInputs;
