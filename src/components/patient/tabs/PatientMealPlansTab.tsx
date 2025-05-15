
import React from 'react';
import PatientMealPlans from '../PatientMealPlans';

interface PatientMealPlansTabProps {
  patientId: string;
}

const PatientMealPlansTab: React.FC<PatientMealPlansTabProps> = ({ patientId }) => {
  return <PatientMealPlans patientId={patientId} />;
};

export default PatientMealPlansTab;
