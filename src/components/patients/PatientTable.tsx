
import React from 'react';
import { Patient, PatientFilters } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface PatientTableProps {
  patients: Patient[];
  totalItems: number;
  filters: PatientFilters;
  onViewDetail: (patientOrId: string | Patient) => Promise<void>;
  onStatusChange: () => void;
  onPageChange: (page: number) => void;
  userId: string;
  renderActions?: (patientData: any) => React.ReactNode;
}

const PatientTable: React.FC<PatientTableProps> = ({ 
  patients, 
  totalItems, 
  filters, 
  onViewDetail, 
  onStatusChange, 
  onPageChange, 
  userId,
  renderActions 
}) => {
  // Render table content here
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Idade</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {patients.map(patient => (
          <TableRow key={patient.id}>
            <TableCell>{patient.name}</TableCell>
            <TableCell>{patient.age}</TableCell>
            <TableCell>{patient.email}</TableCell>
            <TableCell>{patient.status}</TableCell>
            <TableCell>
              {renderActions ? renderActions(patient) : (
                <button onClick={() => onViewDetail(patient)}>Ver detalhes</button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default PatientTable;
