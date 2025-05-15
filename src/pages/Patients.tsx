
import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import { usePatientDetail } from '@/hooks/usePatientDetail';
import { usePatientList } from '@/hooks/patient/usePatientList';

// Import extracted components
import PatientDetailModal from '@/components/patient/PatientDetailModal';
import PatientFiltersComponent from '@/components/patient/PatientFilters';
import PatientPageHeader from '@/components/patients/PatientPageHeader';
import PatientTableHeader from '@/components/patients/PatientTableHeader';
import PatientTable from '@/components/patients/PatientTable';
import PatientLoadingState from '@/components/patients/PatientLoadingState';
import PatientErrorState from '@/components/patients/PatientErrorState';

const Patients = () => {
  // Use the patient detail hook for viewing details
  const { 
    isModalOpen, 
    patient, 
    openPatientDetail, 
    closePatientDetail 
  } = usePatientDetail();
  
  // Use the patient list hook for fetching and filtering patients
  const {
    patients,
    pagination,
    filters,
    isLoading,
    error,
    handlePageChange,
    handleFilterChange,
    handleStatusChange,
    togglePatientStatus,
    refetch
  } = usePatientList({
    initialFilters: {
      status: 'active',
      sortBy: 'name',
      sortOrder: 'asc'
    },
    initialPage: 1,
    initialPageSize: 10
  });
  
  // Calculate if there's an error
  const isError = error !== null;
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <PatientPageHeader />
        
        <PatientFiltersComponent 
          filters={filters}
          onFiltersChange={handleFilterChange}
          onSearch={() => refetch()}
        />
        
        <Card>
          <CardHeader className="pb-2">
            <PatientTableHeader totalItems={pagination.total} />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <PatientLoadingState />
            ) : isError ? (
              <PatientErrorState 
                errorMessage={error?.message || "Failed to load patients"} 
                onRetry={() => refetch()} 
              />
            ) : (
              <PatientTable
                patients={patients}
                totalItems={pagination.total}
                filters={filters}
                onViewDetail={openPatientDetail}
                onStatusChange={() => handleStatusChange(filters.status || 'active')}
                onPageChange={handlePageChange}
              />
            )}
          </CardContent>
        </Card>
        
        {patient && (
          <PatientDetailModal
            isOpen={isModalOpen}
            onClose={closePatientDetail}
            patient={patient}
            onStatusChange={() => handleStatusChange(filters.status || 'active')}
          />
        )}
      </div>
    </div>
  );
};

export default Patients;
