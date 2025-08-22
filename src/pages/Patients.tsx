import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search } from 'lucide-react';
import { Patient, PatientFilters } from '@/types';
import { 
  PatientCard, 
  PatientStatusBadge 
} from '@/components/patient';
import { 
  SearchField, 
  StatusFilter, 
  SortFilter, 
  FilterActions 
} from '@/components/patient/filters';
import { 
  PatientLoadingState, 
  PatientErrorState 
} from '@/components/patients';
import { usePatientFilters } from '@/hooks/patient/usePatientFilters';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Pagination from '@/components/ui/pagination';

const Patients: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // Default page size

  const { filters, updateFilters, resetFilters } = usePatientFilters();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('patients')
        .select('*, total:count', { count: 'exact' });

      if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      // Apply sorting
      if (filters.sortBy) {
        const ascending = filters.sortOrder === 'asc';
        query = query.order(filters.sortBy, { ascending });
      } else {
        // Default sorting by created_at descending
        query = query.order('created_at', { ascending: false });
      }

      const startIndex = (currentPage - 1) * pageSize;
      query = query.range(startIndex, startIndex + pageSize - 1);

      const { data, error: fetchError, count } = await query;

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      setPatients(data || []);
      setTotalItems(count || 0);
      setTotalPages(Math.ceil((count || 0) / pageSize));
    } catch (e: any) {
      setError(e.message);
      toast({
        title: "Erro ao carregar pacientes",
        description: "Ocorreu um erro ao buscar os pacientes. Tente novamente.",
        variant: "destructive",
      });
      console.error("Error fetching patients:", e);
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage, pageSize, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFilterChange = (newFilters: Partial<PatientFilters>) => {
    updateFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleResetFilters = () => {
    resetFilters();
    setCurrentPage(1); // Reset to first page when filters are reset
  };

  const handleSearch = () => {
    setCurrentPage(1); // Reset to first page on search
    fetchData();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-wrap items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-nutri-blue mb-1">Pacientes</h1>
          <p className="text-gray-500">Gerencie seus pacientes ({totalItems} total)</p>
        </div>
        <Button onClick={() => navigate('/patients/new')}>
          <PlusCircle className="h-4 w-4 mr-2" /> Novo Paciente
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0 md:space-x-4">
            <SearchField 
              value={filters.search || ''}
              onChange={(value) => handleFilterChange({ search: value })}
              onSearch={handleSearch}
            />
            <div className="flex items-center space-x-2">
              <StatusFilter
                status={filters.status || 'all'}
                onStatusChange={(status) => handleFilterChange({ status })}
              />
              <SortFilter
                value={`${filters.sortBy}:${filters.sortOrder}`}
                onChange={(sortBy, sortOrder) => handleFilterChange({ sortBy, sortOrder })}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleResetFilters}>
              Resetar
            </Button>
            <Button onClick={handleSearch}>
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <PatientLoadingState />
      ) : error ? (
        <PatientErrorState errorMessage={error} onRetry={fetchData} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {patients.map((patient) => (
            <PatientCard key={patient.id} patient={patient} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default Patients;
