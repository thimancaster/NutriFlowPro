
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { formatDate, getPatientAge } from '@/utils/patientUtils';
import PatientDetailModal from '@/components/patient/PatientDetailModal';
import { Patient, PatientFilters } from '@/types';

interface PatientTableRowProps {
  patient: Patient;
  onStatusChange: () => void;
}

const PatientTableRow: React.FC<PatientTableRowProps> = ({ 
  patient,
  onStatusChange
}) => {
  const [showModal, setShowModal] = useState(false);
  
  const age = getPatientAge(patient.birth_date);
  
  const goalText = patient?.goals?.objective 
    ? patient.goals.objective === 'emagrecimento' 
      ? 'Emagrecimento'
      : patient.goals.objective === 'hipertrofia'
      ? 'Hipertrofia'
      : 'Manutenção'
    : '-';
  
  return (
    <>
      <TableRow>
        <TableCell>
          <div className="font-medium">{patient.name}</div>
          <div className="text-sm text-gray-500">{patient.email || '-'}</div>
        </TableCell>
        <TableCell>{age || '-'}</TableCell>
        <TableCell>{patient.gender === 'M' ? 'Masculino' : patient.gender === 'F' ? 'Feminino' : '-'}</TableCell>
        <TableCell>{formatDate(patient.created_at)}</TableCell>
        <TableCell>{goalText}</TableCell>
        <TableCell>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowModal(true)}
          >
            Detalhes
          </Button>
        </TableCell>
      </TableRow>
      
      {showModal && (
        <PatientDetailModal
          patient={patient}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onStatusChange={onStatusChange}
        />
      )}
    </>
  );
};

export default PatientTableRow;
