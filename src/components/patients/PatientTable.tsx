
import React from 'react';
import { Table, TableHeader, TableBody } from '@/components/ui/table';
import PatientTableHeader from './PatientTableHeader';
import PatientTableContent from './PatientTableContent';
import { Patient, PatientFilters } from '@/types';

interface PatientTableProps {
  patients: Patient[] | null;
  isLoading: boolean;
  error: Error | null;
  onRefresh: () => void;
  filters: PatientFilters;
  onStatusChange: () => void;
}

const PatientTable: React.FC<PatientTableProps> = ({
  patients,
  isLoading,
  error,
  onRefresh,
  filters,
  onStatusChange
}) => {
  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <PatientTableHeader />
        </TableHeader>
        <TableBody>
          <PatientTableContent
            patients={patients}
            isLoading={isLoading}
            error={error}
            onRefresh={onRefresh}
            filters={filters}
            onStatusChange={onStatusChange}
          />
        </TableBody>
      </Table>
    </div>
  );
};

export default PatientTable;
