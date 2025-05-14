
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
    totalPatients,
    filters,
    isLoading,
    isError,
    error,
    refetch,
    handlePageChange,
    handleFiltersChange,
    handleStatusChange
  } = usePatientList({
    page: 1,
    pageSize: 10,
    status: 'active',
    sortBy: 'name',
    sortOrder: 'asc'
  });
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <PatientPageHeader />
        
        <PatientFiltersComponent 
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onSearch={refetch}
        />
        
        <Card>
          <CardHeader className="pb-2">
            <PatientTableHeader totalItems={totalPatients} />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <PatientLoadingState />
            ) : isError ? (
              <PatientErrorState 
                errorMessage={(error as Error).message} 
                onRetry={refetch} 
              />
            ) : (
              <PatientTable
                patients={patients}
                totalItems={totalPatients}
                filters={filters}
                onViewDetail={openPatientDetail}
                onStatusChange={handleStatusChange}
                onPageChange={handlePageChange}
              />
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
