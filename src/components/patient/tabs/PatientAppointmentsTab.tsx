
import React, { memo } from 'react';
import PatientAppointments from '../PatientAppointments';

interface PatientAppointmentsTabProps {
  patientId: string;
}

const PatientAppointmentsTab: React.FC<PatientAppointmentsTabProps> = ({ patientId }) => {
  return <PatientAppointments patientId={patientId} />;
};

export default memo(PatientAppointmentsTab);
