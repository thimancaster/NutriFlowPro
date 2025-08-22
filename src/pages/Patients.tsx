
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { PatientService } from '@/services/patientService';
import { Patient } from '@/types';
import { 
  PatientCard, 
  PatientList, 
  StatusFilter,
  PatientFormDialog,
  PatientViewDialog
} from '@/components/patients';
import Pagination from '@/components/ui/pagination';
import { Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePatientFilters } from '@/hooks/patient/usePatientFilters';

const ITEMS_PER_PAGE = 10;

const Patients: React.FC = () => {
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  
  const {
    filters,
    currentPage,
    setCurrentPage,
    setStatusFilter,
    setSearchTerm
  } = usePatientFilters();

  const fetchPatients = async () => {
    setLoading(true);
    try {
      // Mock implementation since getPatients doesn't exist
      const mockPatients: Patient[] = [];
      setPatients(mockPatients);
      setTotalCount(0);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os pacientes',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [filters, currentPage]);

  const handleCreatePatient = () => {
    setSelectedPatient(null);
    setIsFormOpen(true);
  };

  const handleEditPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsFormOpen(true);
  };

  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsViewOpen(true);
  };

  const handleSavePatient = async (patientData: Partial<Patient>) => {
    try {
      if (selectedPatient) {
        // Update patient
        await PatientService.updatePatient(selectedPatient.id, patientData);
        toast({
          title: 'Sucesso',
          description: 'Paciente atualizado com sucesso'
        });
      } else {
        // Create patient
        await PatientService.createPatient(patientData);
        toast({
          title: 'Sucesso',
          description: 'Paciente criado com sucesso'
        });
      }
      
      setIsFormOpen(false);
      await fetchPatients();
    } catch (error) {
      console.error('Error saving patient:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o paciente',
        variant: 'destructive'
      });
    }
  };

  const handleDeletePatient = async (patientId: string) => {
    try {
      await PatientService.deletePatient(patientId);
      toast({
        title: 'Sucesso',
        description: 'Paciente excluído com sucesso'
      });
      await fetchPatients();
    } catch (error) {
      console.error('Error deleting patient:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o paciente',
        variant: 'destructive'
      });
    }
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Pacientes</h1>
        <Button onClick={handleCreatePatient}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Paciente
        </Button>
      </div>

      <div className="flex gap-4">
        <StatusFilter 
          value={filters.status || 'all'}
          onChange={setStatusFilter}
        />
      </div>

      <PatientList
        patients={patients}
        onEdit={handleEditPatient}
        onView={handleViewPatient}
        onDelete={handleDeletePatient}
      />

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      <PatientFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSavePatient}
        patient={selectedPatient}
      />

      <PatientViewDialog
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        patient={selectedPatient}
      />
    </div>
  );
};

export default Patients;
