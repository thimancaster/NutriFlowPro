
import React from 'react';
import { Patient, PatientFilters } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Archive, Eye, MoreHorizontal, Pencil, RotateCcw, Trash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PatientService } from '@/services/patient';
import { useToast } from '@/hooks/use-toast';
import { Pagination } from '@/components/ui/pagination';

interface PatientTableProps {
  patients: Patient[];
  totalItems: number;
  filters: PatientFilters;
  onViewDetail: (patient: Patient) => void;
  onStatusChange: () => void;
  onPageChange: (page: number) => void;
  userId?: string;
}

const PatientTable: React.FC<PatientTableProps> = ({
  patients,
  totalItems,
  filters,
  onViewDetail,
  onStatusChange,
  onPageChange,
  userId
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleEditClick = (patientId: string) => {
    navigate(`/patients/edit/${patientId}`);
  };

  const handleStatusChange = async (patientId: string, newStatus: 'active' | 'archived') => {
    if (!userId) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const result = await PatientService.updatePatientStatus(patientId, userId, newStatus);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      toast({
        title: newStatus === 'active' ? "Paciente reativado" : "Paciente arquivado",
        description: `O paciente foi ${newStatus === 'active' ? 'reativado' : 'arquivado'} com sucesso.`,
      });
      
      onStatusChange();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: `Não foi possível alterar o status do paciente: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleDeletePatient = async (patientId: string, patientName: string) => {
    if (!userId) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive",
      });
      return;
    }
    
    if (!confirm(`Tem certeza que deseja excluir permanentemente o paciente ${patientName}? Esta ação não pode ser desfeita.`)) {
      return;
    }
    
    try {
      const result = await PatientService.deletePatient(patientId, userId);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      toast({
        title: "Paciente excluído",
        description: `O paciente ${patientName} foi excluído permanentemente.`,
      });
      
      onStatusChange();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: `Não foi possível excluir o paciente: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const totalPages = Math.ceil(totalItems / (filters.pageSize || 10));

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b">
              <th className="pb-2 font-medium text-gray-500">Nome</th>
              <th className="pb-2 font-medium text-gray-500">Email</th>
              <th className="pb-2 font-medium text-gray-500">Telefone</th>
              <th className="pb-2 font-medium text-gray-500">Status</th>
              <th className="pb-2 font-medium text-gray-500 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => (
              <tr key={patient.id} className="border-b last:border-0">
                <td className="py-3">{patient.name}</td>
                <td className="py-3">{patient.email || '-'}</td>
                <td className="py-3">{patient.phone || '-'}</td>
                <td className="py-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    patient.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {patient.status === 'active' ? 'Ativo' : 'Arquivado'}
                  </span>
                </td>
                <td className="py-3 text-right">
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" size="icon" onClick={() => onViewDetail(patient)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleEditClick(patient.id)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleStatusChange(
                          patient.id, 
                          patient.status === 'active' ? 'archived' : 'active'
                        )}>
                          {patient.status === 'active' ? (
                            <><Archive className="h-4 w-4 mr-2" /> Arquivar</>
                          ) : (
                            <><RotateCcw className="h-4 w-4 mr-2" /> Reativar</>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600" 
                          onClick={() => handleDeletePatient(patient.id, patient.name)}
                        >
                          <Trash className="h-4 w-4 mr-2" /> Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <Pagination
            currentPage={filters.page || 1}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};

export default PatientTable;
