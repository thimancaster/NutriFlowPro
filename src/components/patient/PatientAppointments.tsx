
import React from 'react';
import { Patient } from '@/types';

interface PatientAppointmentsProps {
  patient: Patient;
}

const PatientAppointments: React.FC<PatientAppointmentsProps> = ({ patient }) => {
  // This component will be implemented in future tasks
  return (
    <div className="py-4">
      <p className="text-gray-500 italic">Funcionalidade em desenvolvimento</p>
      <p className="text-sm text-gray-400">Agendamentos para {patient.name} aparecerão aqui.</p>
    </div>
  );
};

export default PatientAppointments;
