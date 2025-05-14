
import React from 'react';
import { Patient } from '@/types';

export interface PatientTableContentProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
}

const PatientTableContent: React.FC<PatientTableContentProps> = ({ 
  patients, 
  onSelectPatient 
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="text-left border-b">
            <th className="pb-2 pt-4 px-4">Nome</th>
            <th className="pb-2 pt-4 px-4 hidden md:table-cell">Email</th>
            <th className="pb-2 pt-4 px-4 hidden lg:table-cell">Telefone</th>
            <th className="pb-2 pt-4 px-4 text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient) => (
            <tr 
              key={patient.id} 
              className="border-b hover:bg-gray-50 cursor-pointer"
              onClick={() => onSelectPatient(patient)}
            >
              <td className="py-3 px-4">{patient.name}</td>
              <td className="py-3 px-4 hidden md:table-cell">{patient.email}</td>
              <td className="py-3 px-4 hidden lg:table-cell">{patient.phone}</td>
              <td className="py-3 px-4 text-right">
                <button 
                  className="text-blue-600 hover:text-blue-800"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectPatient(patient);
                  }}
                >
                  Visualizar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PatientTableContent;
