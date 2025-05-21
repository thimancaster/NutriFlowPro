
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
import { usePatient } from '@/contexts/PatientContext';

const Patients = () => {
  const { user } = useAuth();
  const { startPatientSession } = usePatient();
  
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
    pagination,
    filters,
    isLoading,
    error,
    isError,
    handlePageChange,
    handleFilterChange,
    handleStatusChange,
    refetch
  } = usePatientList();
  
  // Function to handle patient status change and refresh
  const handlePatientStatusChange = async () => {
    refetch();
    if (patient) {
      // Refresh the patient details after status change
      const updatedPatient = patients.find(p => p.id === patient.id);
      if (updatedPatient) {
        // Update local patient state with the refreshed data
        openPatientDetail(updatedPatient);
      }
    }
  };

  // Handle starting a session with a patient
  const handleStartPatientSession = (selectedPatient) => {
    startPatientSession(selectedPatient);
  };

  // Extend the PatientTable component to include patient action buttons
  const renderPatientActions = (patientData) => (
    <div className="flex space-x-2">
      <Link to={`/calculator?patientId=${patientData.id}`}>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={() => handleStartPatientSession(patientData)}
        >
          <Calculator className="h-4 w-4" />
          <span className="hidden md:inline">Calculadora</span>
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
          <span className="hidden md:inline">Plano Alimentar</span>
        </Button>
      </Link>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <PatientPageHeader />
      
      <PatientFiltersComponent 
        filters={filters}
        onFiltersChange={handleFilterChange}
        onStatusChange={handleStatusChange}
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
