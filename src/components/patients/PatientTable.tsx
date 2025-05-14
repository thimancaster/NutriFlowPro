
import React from 'react';
import { Patient, PatientFilters } from '@/types';
import PatientTableRow from './PatientTableRow';
import PatientEmptyState from './PatientEmptyState';
import PatientPagination from '@/components/patient/PatientPagination';

interface PatientTableProps {
  patients: Patient[];
  totalItems: number;
  filters: PatientFilters;
  onViewDetail: (patient: Patient) => void;
  onStatusChange: () => void;
  onPageChange: (page: number) => void;
}

const PatientTable = ({ 
  patients, 
  totalItems, 
  filters, 
  onViewDetail, 
  onStatusChange,
  onPageChange 
}: PatientTableProps) => {
  if (patients.length === 0) {
    return <PatientEmptyState filters={filters} />;
  }
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="py-3 px-4 text-left">Nome</th>
            <th className="py-3 px-4 text-left hidden md:table-cell">Email</th>
            <th className="py-3 px-4 text-left hidden md:table-cell">Telefone</th>
            <th className="py-3 px-4 text-left hidden lg:table-cell">Objetivo</th>
            <th className="py-3 px-4 text-center hidden md:table-cell">Status</th>
            <th className="py-3 px-4 text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient: Patient) => (
            <PatientTableRow 
              key={patient.id} 
              patient={patient}
              onViewDetail={onViewDetail}
              onStatusChange={onStatusChange}
            />
          ))}
        </tbody>
      </table>
      
      <PatientPagination 
        currentPage={filters.page}
        totalItems={totalItems}
        pageSize={filters.pageSize}
        onPageChange={onPageChange}
      />
    </div>
  );
};

export default PatientTable;
