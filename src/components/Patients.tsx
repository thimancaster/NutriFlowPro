
import React from 'react';
import { usePatientList } from '@/hooks/patient/usePatientList';
import PatientPageHeader from './patients/PatientPageHeader';
import PatientListHeader from './patients/PatientListHeader';
import PatientTable from './patients/PatientTable';
import PatientLoadingState from './patients/PatientLoadingState';
import PatientErrorState from './patients/PatientErrorState';
import PatientEmptyState from './patients/PatientEmptyState';
import PatientPagination from './patient/PatientPagination';

const Patients = () => {
  const {
    patients,
    isLoading,
    error,
    filters,
    pagination,
    totalPatients,
    handleFilterChange,
    handlePageChange,
    handleStatusChange,
    refetch
  } = usePatientList();

  if (isLoading) {
    return <PatientLoadingState />;
  }

  if (error) {
    return <PatientErrorState errorMessage={error.message} onRetry={refetch} />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PatientPageHeader />
      
      <div className="bg-white rounded-xl shadow-lg p-6">
        <PatientListHeader 
          totalItems={totalPatients}
          filters={filters}
          onFilterChange={handleFilterChange}
        />
        
        {patients.length === 0 ? (
          <PatientEmptyState />
        ) : (
          <>
            <PatientTable 
              patients={patients}
              totalItems={totalPatients}
              filters={filters}
              onViewDetail={async (patientOrId) => {
                // Handle view detail logic
              }}
              onStatusChange={refetch}
              onPageChange={handlePageChange}
            />
            
            <PatientPagination
              currentPage={pagination.currentPage}
              totalItems={totalPatients}
              pageSize={pagination.pageSize}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Patients;
