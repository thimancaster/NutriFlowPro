
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2 } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Patient, PatientFilters } from '@/types';
import PatientListActions from '@/components/PatientListActions';
import PatientDetailModal from '@/components/patient/PatientDetailModal';
import PatientFiltersComponent from '@/components/patient/PatientFilters';
import PatientPagination from '@/components/patient/PatientPagination';
import { usePatientDetail } from '@/hooks/usePatientDetail';
import { useNavigate } from 'react-router-dom';
import { PatientService } from '@/services/patient';
import { Badge } from '@/components/ui/badge';

const Patients = () => {
  const { user } = useAuth();
  const { isModalOpen, patientId, patient, isLoading: isLoadingPatient, openPatientDetail, closePatientDetail } = usePatientDetail();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [filters, setFilters] = useState<PatientFilters>({
    page: 1,
    pageSize: 10,
    status: 'active',
    sortBy: 'name',
    sortOrder: 'asc',
  });
  
  // Use the enhanced PatientService for fetching patients
  const { 
    data: patientsData, 
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['patients', user?.id, filters],
    queryFn: async () => {
      if (!user) return { data: [], total: 0 };
      
      const result = await PatientService.getPatients(user.id, filters);
        
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch patients');
      }
        
      return { data: result.data || [], total: result.total || 0 };
    },
    enabled: !!user,
  });
  
  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };
  
  const handleFiltersChange = (newFilters: PatientFilters) => {
    setFilters(newFilters);
  };
  
  const handleStatusChange = () => {
    // Refetch patients when status changes
    queryClient.invalidateQueries({ queryKey: ['patients'] });
    closePatientDetail();
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-nutri-blue mb-2">Pacientes</h1>
            <p className="text-gray-600">Gerencie seus pacientes e acesse consultas anteriores</p>
          </div>
          <Button 
            className="bg-nutri-green hover:bg-nutri-green-dark mt-4 md:mt-0"
            onClick={() => navigate('/patients/new')}
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Novo Paciente
          </Button>
        </div>
        
        <PatientFiltersComponent 
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onSearch={refetch}
        />
        
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle>Lista de Pacientes</CardTitle>
              <div className="text-sm text-gray-500">
                Total: {patientsData?.total || 0} pacientes
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <Loader2 className="inline-block animate-spin rounded-full h-8 w-8 text-nutri-blue" />
                <p className="mt-2 text-gray-600">Carregando pacientes...</p>
              </div>
            ) : isError ? (
              <div className="text-center py-8">
                <p className="text-red-500">Erro ao carregar pacientes: {(error as Error).message}</p>
                <Button 
                  onClick={() => refetch()}
                  className="mt-4"
                >
                  Tentar novamente
                </Button>
              </div>
            ) : patientsData && patientsData.data && patientsData.data.length > 0 ? (
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
                    {patientsData.data.map((patient: Patient) => (
                      <tr key={patient.id} className="border-b hover:bg-gray-50">
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
                            onViewDetail={openPatientDetail}
                            onStatusChange={() => refetch()}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                <PatientPagination 
                  currentPage={filters.page}
                  totalItems={patientsData.total}
                  pageSize={filters.pageSize}
                  onPageChange={handlePageChange}
                />
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  {filters.search 
                    ? 'Nenhum paciente encontrado com os termos de busca.' 
                    : filters.status === 'archived'
                      ? 'Não há pacientes arquivados.'
                      : filters.status === 'all'
                        ? 'Você ainda não tem pacientes cadastrados.'
                        : 'Você ainda não tem pacientes ativos cadastrados.'
                  }
                </p>
                {!filters.search && (
                  <Button 
                    className="mt-4 bg-nutri-green hover:bg-nutri-green-dark"
                    onClick={() => navigate('/patients/new')}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Paciente
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Patient Detail Modal */}
        <PatientDetailModal
          open={isModalOpen}
          onClose={closePatientDetail}
          patient={patient}
          onStatusChange={handleStatusChange}
        />
      </div>
    </div>
  );
};

export default Patients;
