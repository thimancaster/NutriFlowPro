
import React from 'react';
import { Patient } from '@/types';
import PatientListActions from '@/components/PatientListActions';

interface PatientTableContentProps {
  patients: Patient[];
  onViewDetail: (patient: Patient) => void;
  onStatusChange: () => void;
}

const PatientTableContent = ({ patients, onViewDetail, onStatusChange }: PatientTableContentProps) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4">Nome</th>
            <th className="text-left py-3 px-4">E-mail</th>
            <th className="text-left py-3 px-4">Telefone</th>
            <th className="text-left py-3 px-4">Objetivo</th>
            <th className="text-right py-3 px-4">Ações</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient) => (
            <tr key={patient.id} className="border-b">
              <td className="py-3 px-4">{patient.name}</td>
              <td className="py-3 px-4">{patient.email || '-'}</td>
              <td className="py-3 px-4">{patient.phone || '-'}</td>
              <td className="py-3 px-4">
                {patient.goals?.objective || '-'}
              </td>
              <td className="py-2 px-4 text-right">
                <PatientListActions 
                  patient={patient} 
                  onViewDetail={onViewDetail}
                  onStatusChange={onStatusChange}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PatientTableContent;
