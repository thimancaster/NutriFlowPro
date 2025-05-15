
import React, { useState } from 'react';
import Layout from './Layout';
import { usePatientList } from '@/hooks/patient/usePatientList';
import PatientTableContent from './patients/PatientTableContent';
import PatientErrorState from './patients/PatientErrorState';
import PatientEmptyState from './patients/PatientEmptyState';
import PatientLoadingState from './patients/PatientLoadingState';
import PatientSearchBar from './patients/PatientSearchBar';
import PatientStatusFilter from './patients/PatientStatusFilter';
import PatientPageHeader from './patients/PatientPageHeader';
import PatientPagination from './patient/PatientPagination';
import { Patient } from '@/types';

const Patients = () => {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  const {
    patients,
    isLoading,
    error,
    filters,
    pagination,
    handlePageChange,
    handleFilterChange,
    handleStatusChange,
    togglePatientStatus,
    refetch
  } = usePatientList();

  const handleOpenDetailModal = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedPatient(null);
  };

  const handleSearchChange = (search: string) => {
    handleFilterChange({
      ...filters,
      search: search || undefined
    });
  };

  // Modified to accept a status parameter
  const onStatusChange = (status: "active" | "archived" | "all") => {
    handleStatusChange(status);
  };

  // Content rendering based on state
  const renderContent = () => {
    if (isLoading) {
      return <PatientLoadingState />;
    }

    if (error) {
      return <PatientErrorState 
        errorMessage={error.message} 
        onRetry={refetch} 
      />;
    }

    if (patients.length === 0) {
      return <PatientEmptyState 
        filters={filters} 
        hasSearchFilter={!!filters.search || filters.status !== 'active'} 
      />;
    }

    return (
      <div className="flex flex-col">
        <PatientTableContent
          patients={patients}
          onSelectPatient={handleOpenDetailModal}
        />
        
        <div className="mt-6">
          <PatientPagination
            currentPage={pagination.page}
            totalItems={pagination.total}
            pageSize={pagination.pageSize}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <PatientPageHeader />

        <div className="mb-6 flex flex-col md:flex-row gap-4 md:items-center justify-between">
          <PatientSearchBar
            value={filters.search || ''}
            onSearchChange={handleSearchChange}
          />
          
          <PatientStatusFilter
            currentStatus={filters.status || 'active'}
            onStatusChange={onStatusChange}
          />
        </div>

        {renderContent()}

        {/* Patient detail modal will be rendered in a Portal to avoid z-index issues */}
        {selectedPatient && isDetailModalOpen && (
          <div>
            {/* PatientDetailModal logic was moved to its own component */}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Patients;
