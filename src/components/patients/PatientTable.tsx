
import React from 'react';
import { Patient, PatientFilters } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Eye, Calculator, Utensils } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { calculateAge } from '@/utils/patient';

interface PatientTableProps {
  patients: Patient[];
  totalItems: number;
  filters: PatientFilters;
  onViewDetail: (patientOrId: string | Patient) => Promise<void>;
  onStatusChange: () => void;
  onPageChange: (page: number) => void;
  userId?: string;
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
  const navigate = useNavigate();

  const handleEditPatient = (patientId: string) => {
    navigate(`/patients/edit/${patientId}`);
  };

  const handleViewProfile = (patientId: string) => {
    navigate(`/patients/${patientId}`);
  };

  // Função melhorada para calcular idade com tratamento de erros
  const getPatientAge = (birthDate?: string): string => {
    if (!birthDate) return 'N/A';
    
    try {
      const age = calculateAge(birthDate);
      return age !== null ? `${age} anos` : 'N/A';
    } catch (error) {
      console.error('Erro ao calcular idade:', error);
      return 'N/A';
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead className="hidden md:table-cell">Email</TableHead>
            <TableHead className="hidden lg:table-cell">Idade</TableHead>
            <TableHead className="hidden sm:table-cell">Status</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map((patient) => {
            return (
              <TableRow key={patient.id} className="hover:bg-gray-50">
                <TableCell className="font-medium">{patient.name}</TableCell>
                <TableCell className="hidden md:table-cell text-gray-600">
                  {patient.email || 'Não informado'}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {getPatientAge(patient.birth_date)}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge variant={patient.status === 'active' ? 'default' : 'secondary'}>
                    {patient.status === 'active' ? 'Ativo' : 'Arquivado'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-1">
                    {/* Botão Ver Perfil */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewProfile(patient.id)}
                      title="Ver Perfil"
                      className="flex items-center gap-1"
                    >
                      <Eye className="h-4 w-4" />
                      <span className="hidden md:inline">Perfil</span>
                    </Button>

                    {/* Botão Editar */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditPatient(patient.id)}
                      title="Editar Paciente"
                      className="flex items-center gap-1 border-blue-200 text-blue-600 hover:bg-blue-50"
                    >
                      <Edit className="h-4 w-4" />
                      <span className="hidden md:inline">Editar</span>
                    </Button>

                    {/* Botões de ação customizados (Calculadora e Plano Alimentar) */}
                    {renderActions && renderActions(patient)}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      
      {patients.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Nenhum paciente encontrado
        </div>
      )}
    </div>
  );
};

export default PatientTable;
