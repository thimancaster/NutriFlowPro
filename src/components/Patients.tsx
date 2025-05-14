
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { PatientService } from '@/services/patient';
import { useAuth } from '@/contexts/auth/AuthContext';
import PatientPagination from '@/components/patient/PatientPagination';
import PatientDetailModal from '@/components/patient/PatientDetailModal';
import { usePatientDetail } from '@/hooks/usePatientDetail';
import { PatientFilters as PatientFiltersType } from '@/types';

// Import the new refactored components
import PatientListHeader from './patients/PatientListHeader';
import PatientCardHeader from './patients/PatientCardHeader';
import PatientTableContent from './patients/PatientTableContent';
import PatientEmptyState from './patients/PatientEmptyState';
import PatientLoadingSpinner from './patients/PatientLoadingSpinner';

const Patients = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<PatientFiltersType>({
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

  const handleStatusChange = (value: 'active' | 'archived' | 'all') => {
    setFilters({ ...filters, status: value, page: 1 });
  };

  const handleFiltersChange = (newFilters: PatientFiltersType) => {
    setFilters({ ...filters, ...newFilters, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PatientListHeader 
        title="Pacientes" 
        subtitle="Gerencie seus pacientes" 
      />

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <PatientCardHeader 
            filters={filters}
            onSearchChange={handleSearchChange}
            onClearSearch={handleClearSearch}
            onStatusChange={handleStatusChange}
            onFiltersChange={handleFiltersChange}
            onSearch={fetchPatients}
          />
        </CardHeader>

        <CardContent>
          {loading ? (
            <PatientLoadingSpinner />
          ) : patients.length === 0 ? (
            <PatientEmptyState hasSearchFilter={!!filters.search} />
          ) : (
            <PatientTableContent 
              patients={patients}
              onViewDetail={openPatientDetail}
              onStatusChange={fetchPatients}
            />
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
