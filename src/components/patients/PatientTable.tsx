
import React from 'react';
import { Patient, PaginationParams, PatientFilters } from '@/types';
import PatientListActions from '@/components/PatientListActions';

interface PatientTableProps {
  patients: Patient[];
  totalItems: number;
  filters: PatientFilters;
  onViewDetail: (patient: Patient) => void;
  onStatusChange: () => void;
  onPageChange: (page: number) => void;
}

const PatientTable: React.FC<PatientTableProps> = ({
  patients,
  totalItems,
  filters,
  onViewDetail,
  onStatusChange,
  onPageChange
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left border-b">
            <th className="pb-2 font-medium text-gray-500">Nome</th>
            <th className="pb-2 font-medium text-gray-500">Email</th>
            <th className="pb-2 font-medium text-gray-500">Telefone</th>
            <th className="pb-2 font-medium text-gray-500 text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient) => (
            <tr key={patient.id} className="border-b last:border-0">
              <td className="py-3">{patient.name}</td>
              <td className="py-3">{patient.email || '-'}</td>
              <td className="py-3">{patient.phone || '-'}</td>
              <td className="py-3 text-right">
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

export default PatientTable;
