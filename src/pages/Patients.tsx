
import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { usePatientDetail } from '@/hooks/patient/usePatientDetail';
import { usePatientList } from '@/hooks/patient/usePatientList';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calculator, Utensils } from 'lucide-react';

// Import extracted components
import PatientDetailModal from '@/components/patient/PatientDetailModal';
import PatientFiltersComponent from '@/components/patient/PatientFilters';
import PatientPageHeader from '@/components/patients/PatientPageHeader';
import PatientTableHeader from '@/components/patients/PatientTableHeader';
import PatientTable from '@/components/patients/PatientTable';
import PatientLoadingState from '@/components/patients/PatientLoadingState';
import PatientErrorState from '@/components/patients/PatientErrorState';
import { usePatient } from '@/contexts/patient/PatientContext';
import { Patient } from '@/types';

const Patients = () => {
  const { user } = useAuth();
  const { startPatientSession } = usePatient();
  
  // Custom wrapper for the patient detail functionality
  const { 
    patient, 
    refetch: refetchPatientDetail,
    isLoading: isPatientDetailLoading,
    error: patientDetailError,
    isError: isPatientDetailError
  } = usePatientDetail();
  
  // Manual implementation of the missing properties
  const isModalOpen = !!patient;
  
  const openPatientDetail = async (patientOrId: string | Patient) => {
    if (typeof patientOrId === 'string') {
      window.location.href = `/patients/${patientOrId}`;
    } else {
      window.location.href = `/patients/${patientOrId.id}`;
    }
    return Promise.resolve();
  };
  
  const closePatientDetail = () => {
    window.history.back();
  };
  
  // Use the patient list hook for fetching and filtering patients
  const {
    patients,
    totalPatients,
    pagination,
    filters,
    isLoading,
    error,
    handlePageChange,
    handleFilterChange,
    handleStatusChange,
    refetch
  } = usePatientList();
  
  // Function to handle patient status change and refresh
  const handlePatientStatusChange = async () => {
    await refetch();
    if (patient) {
      // Refresh the patient details after status change
      const updatedPatient = patients.find(p => p.id === patient.id);
      if (updatedPatient) {
        // Update local patient state with the refreshed data
        await openPatientDetail(updatedPatient.id);
      }
    }
  };

  // Handle starting a session with a patient
  const handleStartPatientSession = (selectedPatient: Patient) => {
    startPatientSession(selectedPatient);
  };

  // Extend the PatientTable component to include patient action buttons
  const renderPatientActions = (patientData: Patient) => (
    <div className="flex space-x-1">
      <Link to={`/calculator?patientId=${patientData.id}`}>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={() => handleStartPatientSession(patientData)}
        >
          <Calculator className="h-4 w-4" />
          <span className="hidden lg:inline">Calculadora</span>
        </Button>
      </Link>
      
      <Link to={`/meal-plans?patientId=${patientData.id}`}>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={() => handleStartPatientSession(patientData)}
        >
          <Utensils className="h-4 w-4" />
          <span className="hidden lg:inline">Plano</span>
        </Button>
      </Link>
    </div>
  );

  // Create a wrapper function to handle the status change signature mismatch
  const handleStatusChangeWrapper = (status: 'active' | 'archived' | 'all') => {
    handleStatusChange(status);
  };

  const handleSearchAction = () => {
    // The search is handled automatically by the filter changes
    console.log('Search triggered');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PatientPageHeader />
      
      <PatientFiltersComponent 
        filters={filters}
        onFiltersChange={handleFilterChange}
        onStatusChange={handleStatusChangeWrapper}
        onSearch={handleSearchAction}
      />
      
      <Card>
        <CardHeader className="pb-2">
          <PatientTableHeader totalItems={pagination.total} />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <PatientLoadingState />
          ) : error ? (
            <PatientErrorState 
              errorMessage={error.message} 
              onRetry={() => refetch()} 
            />
          ) : (
            <PatientTable
              patients={patients}
              totalItems={pagination.total}
              filters={filters}
              onViewDetail={openPatientDetail}
              onStatusChange={refetch}
              onPageChange={handlePageChange}
              userId={user?.id}
              renderActions={renderPatientActions}
            />
          )}
        </CardContent>
      </Card>
      
      {patient && (
        <PatientDetailModal
          isOpen={isModalOpen}
          onClose={closePatientDetail}
          patient={patient}
          onStatusChange={handlePatientStatusChange}
        />
      )}
    </div>
  );
};

export default Patients;
