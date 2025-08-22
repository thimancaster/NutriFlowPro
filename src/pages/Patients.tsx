import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, RefreshCw, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PatientService } from '@/services/patient/PatientService';
import { Patient, PatientFilters } from '@/types/patient';
import { StatusFilter, SearchField, SortFilter } from '@/components/patient/filters';
import { PatientCard } from '@/components/patient';
import { PatientFormDialog } from '@/components/patient/PatientFormDialog';
import { PatientViewDialog } from '@/components/patient/PatientViewDialog';
import { Pagination } from '@/components/ui/pagination';

const ITEMS_PER_PAGE = 12;

const Patients: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [showNewPatientDialog, setShowNewPatientDialog] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filters, setFilters] = useState<PatientFilters>({
    search: '',
    status: 'all',
    page: 1,
    limit: ITEMS_PER_PAGE,
    sortBy: 'name',
    sortOrder: 'asc'
  });

  const { data: patientsData, isLoading, error, refetch } = useQuery({
    queryKey: ['patients', filters],
    queryFn: async () => {
      const result = await PatientService.getPatients(filters);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch patients');
      }
      return result;
    },
    staleTime: 30000,
  });

  useEffect(() => {
    if (patientsData?.success && patientsData.data) {
      // Transform the data to match our Patient interface
      const transformedPatients = patientsData.data.map((patient: any) => ({
        ...patient,
        gender: patient.gender || 'other' as 'male' | 'female' | 'other'
      }));
      setPatients(transformedPatients);
    }
  }, [patientsData]);

  const handleStatusFilter = useCallback((status: 'active' | 'archived' | 'all') => {
    setFilters(prev => ({ ...prev, status, page: 1 }));
  }, []);

  const handleSort = useCallback((sortBy: string, sortOrder: 'asc' | 'desc') => {
    setFilters(prev => ({ ...prev, sortBy, sortOrder, page: 1 }));
  }, []);

  const totalPages = Math.ceil((patientsData?.total || 0) / ITEMS_PER_PAGE);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao carregar pacientes</h3>
          <p className="text-gray-500 mb-4">{error instanceof Error ? error.message : 'Erro desconhecido'}</p>
          <Button onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Pacientes</h1>
        <Button onClick={() => setShowNewPatientDialog(true)} className="bg-nutri-green hover:bg-nutri-green-dark">
          <PlusCircle className="mr-2 h-4 w-4" />
          Novo Paciente
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <SearchField 
            value={filters.search || ''} 
            onChange={(search) => setFilters(prev => ({ ...prev, search, page: 1 }))}
            onSearch={() => {}}
          />
        </div>
        <StatusFilter 
          value={filters.status || 'all'} 
          onChange={handleStatusFilter}
        />
        <SortFilter 
          value={`${filters.sortBy}:${filters.sortOrder}`}
          onChange={handleSort}
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-nutri-green" />
        </div>
      ) : patients.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">Nenhum paciente encontrado</p>
          <Button onClick={() => setShowNewPatientDialog(true)} className="bg-nutri-green hover:bg-nutri-green-dark">
            <PlusCircle className="mr-2 h-4 w-4" />
            Cadastrar primeiro paciente
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {patients.map((patient) => (
              <PatientCard
                key={patient.id}
                patient={patient}
                onClick={() => setSelectedPatient(patient)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={filters.page || 1}
              totalPages={totalPages}
              onPageChange={(page) => setFilters(prev => ({ ...prev, page }))}
            />
          )}
        </>
      )}

      {/* Dialogs */}
      <PatientFormDialog
        open={showNewPatientDialog}
        onClose={() => setShowNewPatientDialog(false)}
        onSuccess={() => {
          refetch();
          setShowNewPatientDialog(false);
        }}
      />

      <PatientViewDialog
        patient={selectedPatient}
        open={!!selectedPatient}
        onClose={() => setSelectedPatient(null)}
        onEdit={(patient) => {
          setEditingPatient(patient);
          setSelectedPatient(null);
        }}
        onSuccess={() => {
          refetch();
          setSelectedPatient(null);
        }}
      />

      <PatientFormDialog
        open={!!editingPatient}
        editPatient={editingPatient}
        onClose={() => setEditingPatient(null)}
        onSuccess={() => {
          refetch();
          setEditingPatient(null);
        }}
      />
    </div>
  );
};

export default Patients;
