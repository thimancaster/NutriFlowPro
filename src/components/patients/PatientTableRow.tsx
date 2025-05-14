
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Patient } from '@/types';
import PatientListActions from '@/components/PatientListActions';

interface PatientTableRowProps {
  patient: Patient;
  onViewDetail: (patient: Patient) => void;
  onStatusChange: () => void;
}

const PatientTableRow = ({ patient, onViewDetail, onStatusChange }: PatientTableRowProps) => {
  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="py-3 px-4">{patient.name}</td>
      <td className="py-3 px-4 hidden md:table-cell">{patient.email || '-'}</td>
      <td className="py-3 px-4 hidden md:table-cell">{patient.phone || '-'}</td>
      <td className="py-3 px-4 hidden lg:table-cell">
        {patient.goals?.objective 
          ? patient.goals.objective.charAt(0).toUpperCase() + patient.goals.objective.slice(1)
          : '-'
        }
      </td>
      <td className="py-3 px-4 hidden md:table-cell text-center">
        <Badge 
          variant="outline" 
          className={
            patient.status === 'archived' 
              ? 'border-amber-500 text-amber-700 bg-amber-50' 
              : 'border-green-500 text-green-700 bg-green-50'
          }
        >
          {patient.status === 'archived' ? 'Arquivado' : 'Ativo'}
        </Badge>
      </td>
      <td className="py-3 px-4 text-right">
        <PatientListActions 
          patient={patient} 
          onViewDetail={onViewDetail}
          onStatusChange={onStatusChange}
        />
      </td>
    </tr>
  );
};

export default PatientTableRow;
