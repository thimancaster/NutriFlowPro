
import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Patient } from '@/types';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from '@/components/ui/dropdown-menu';

interface PatientTableRowProps {
  patient: Patient;
  onViewDetail: (patient: Patient) => void;
  onToggleStatus?: (patientId: string, newStatus: 'active' | 'archived') => void;
}

const PatientTableRow = ({ patient, onViewDetail, onToggleStatus }: PatientTableRowProps) => {
  const getTimeAgo = (dateStr: string | Date) => {
    try {
      const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
      return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
    } catch (err) {
      return 'Unknown date';
    }
  };

  return (
    <tr className="border-b hover:bg-gray-50 transition-colors">
      <td className="py-4 px-4">
        <div className="flex flex-col">
          <span className="font-medium">{patient.name}</span>
          {patient.email && <span className="text-sm text-gray-500">{patient.email}</span>}
        </div>
      </td>
      
      <td className="py-4 px-4">
        <span className={`px-2 py-1 text-xs rounded-full ${
          patient.status === 'active' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {patient.status === 'active' ? 'Ativo' : 'Arquivado'}
        </span>
      </td>
      
      <td className="py-4 px-4 whitespace-nowrap">
        {patient.created_at && getTimeAgo(patient.created_at)}
      </td>
      
      <td className="py-4 px-4 text-right">
        <div className="flex justify-end items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onViewDetail(patient)}
            className="text-gray-500 hover:text-blue-700"
          >
            <Eye className="h-4 w-4" />
          </Button>
          
          {onToggleStatus && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-500">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => onToggleStatus(
                    patient.id, 
                    patient.status === 'active' ? 'archived' : 'active'
                  )}
                >
                  {patient.status === 'active' ? 'Arquivar' : 'Ativar'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </td>
    </tr>
  );
};

export default PatientTableRow;
