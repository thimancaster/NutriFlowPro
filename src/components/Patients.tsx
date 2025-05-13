
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, UserPlus, Search, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { PatientService } from '@/services/patientService';
import { useAuth } from '@/contexts/auth/AuthContext';
import PatientListActions from '@/components/PatientListActions';
import PatientPagination from '@/components/patient/PatientPagination';
import PatientDetailModal from '@/components/patient/PatientDetailModal';
import PatientFilters from '@/components/patient/PatientFilters';
import { usePatientDetail } from '@/hooks/usePatientDetail';

const Patients = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: 'active',
    startDate: '',
    endDate: '',
    sortBy: 'name',
    sortOrder: 'asc',
    page: 1,
    pageSize: 10
  });
  const [totalPatients, setTotalPatients] = useState(0);
  const { 
    isModalOpen, 
    patient, 
    isLoading: patientLoading, 
    openPatientDetail, 
    closePatientDetail 
  } = usePatientDetail();

  useEffect(() => {
    fetchPatients();
  }, [filters, user]);

  const fetchPatients = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const result = await PatientService.getPatients(user.id, filters);
      
      if (result.success) {
        setPatients(result.data);
        setTotalPatients(result.count || 0);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Failed to fetch patients:', error);
      toast({
        title: 'Erro ao carregar pacientes',
        description: 'Não foi possível carregar a lista de pacientes.',
        variant: 'destructive',
      });
      setPatients([]);
      setTotalPatients(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, search: e.target.value, page: 1 });
  };

  const handleClearSearch = () => {
    if (filters.search) {
      setFilters({ ...filters, search: '', page: 1 });
    }
  };

  const handleStatusChange = (value: string) => {
    setFilters({ ...filters, status: value, page: 1 });
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters({ ...filters, ...newFilters, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  const handleAddPatient = () => {
    navigate('/patients/new');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-wrap items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-nutri-blue mb-1">Pacientes</h1>
          <p className="text-gray-500">Gerencie seus pacientes</p>
        </div>
        <Button onClick={handleAddPatient}>
          <UserPlus className="h-4 w-4 mr-2" /> Novo Paciente
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Buscar pacientes..."
                className="pl-9"
                value={filters.search}
                onChange={handleSearchChange}
              />
              {filters.search && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={handleClearSearch}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="w-[180px]">
              <Select value={filters.status} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="archived">Arquivados</SelectItem>
                  <SelectItem value="all">Todos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <PatientFilters 
              filters={filters} 
              onFilterChange={handleFilterChange} 
            />
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nutri-blue"></div>
            </div>
          ) : patients.length === 0 ? (
            <div className="text-center py-10">
              <User className="h-12 w-12 mx-auto text-gray-400" />
              <h3 className="mt-2 text-lg font-medium">Nenhum paciente encontrado</h3>
              <p className="text-gray-500 mt-1">
                {filters.search 
                  ? 'Tente uma busca diferente ou limpe os filtros' 
                  : 'Clique em "Novo Paciente" para adicionar seu primeiro paciente'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Nome</th>
                    <th className="text-left py-3 px-4">E-mail</th>
                    <th className="text-left py-3 px-4">Telefone</th>
                    <th className="text-left py-3 px-4">Objetivo</th>
                    <th className="text-right py-3 px-4">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((patient) => (
                    <tr key={patient.id} className="border-b">
                      <td className="py-3 px-4">{patient.name}</td>
                      <td className="py-3 px-4">{patient.email || '-'}</td>
                      <td className="py-3 px-4">{patient.phone || '-'}</td>
                      <td className="py-3 px-4">
                        {patient.goals?.objective || '-'}
                      </td>
                      <td className="py-2 px-4 text-right">
                        <PatientListActions 
                          patient={patient} 
                          onViewDetail={openPatientDetail}
                          onStatusChange={fetchPatients}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>

        <CardFooter>
          <PatientPagination 
            currentPage={filters.page}
            totalItems={totalPatients}
            pageSize={filters.pageSize}
            onPageChange={handlePageChange}
          />
        </CardFooter>
      </Card>

      {patient && (
        <PatientDetailModal
          patient={patient}
          open={isModalOpen}
          onClose={closePatientDetail}
          onStatusChange={fetchPatients}
        />
      )}
    </div>
  );
};

export default Patients;
