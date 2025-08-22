import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/AuthContext';
import { PatientService } from '@/services/patientService';
import { Patient, PatientFilters } from '@/types/patient';
import PatientListHeader from '@/components/patients/PatientListHeader';
import PatientCard from '@/components/patient/PatientCard';
import PatientLoadingState from '@/components/patients/PatientLoadingState';
import PatientErrorState from '@/components/patients/PatientErrorState';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button';
import { DotsHorizontalIcon } from '@radix-ui/react-icons';

const Patients = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPatients, setTotalPatients] = useState(0);
  const [filters, setFilters] = useState<PatientFilters>({
    search: '',
    status: 'all',
    page: 1,
    limit: 10,
    sortBy: 'created_at',
    sortOrder: 'desc',
  });

  const transformPatientData = (rawPatient: any): Patient => {
    return {
      id: rawPatient.id,
      name: rawPatient.name,
      email: rawPatient.email || '',
      phone: rawPatient.phone || '',
      secondaryPhone: rawPatient.secondaryphone || '',
      cpf: rawPatient.cpf || '',
      birth_date: rawPatient.birth_date || '',
      gender: rawPatient.gender as 'male' | 'female' | 'other' || 'other',
      address: rawPatient.address || '',
      notes: rawPatient.notes || '',
      status: rawPatient.status === 'inactive' ? 'archived' : (rawPatient.status as 'active' | 'archived' || 'active'),
      goals: rawPatient.goals || {},
      created_at: rawPatient.created_at,
      updated_at: rawPatient.updated_at,
      user_id: rawPatient.user_id,
      age: rawPatient.birth_date ? calculateAge(rawPatient.birth_date) : undefined
    };
  };

  const loadPatients = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const result = await PatientService.getPatients(user.id, { status: filters.status });
      
      if (result.success && result.data) {
        const patientsArray = Array.isArray(result.data) ? result.data : [result.data];
        const transformedPatients = patientsArray.map(transformPatientData);
        setPatients(transformedPatients);
        setTotalPatients(transformedPatients.length);
      } else {
        toast({
          title: "Erro",
          description: result.error || "Falha ao carregar pacientes",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro inesperado",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePatient = async (patientData: Partial<Patient>) => {
    if (!user?.id) return;

    try {
      const createData = {
        ...patientData,
        user_id: user.id,
        name: patientData.name || '',
        gender: patientData.gender || 'other',
        status: patientData.status || 'active',
      } as Omit<Patient, 'id' | 'created_at' | 'updated_at'>;

      const result = await PatientService.createPatient(createData);
      
      if (result.success) {
        await loadPatients();
        toast({
          title: "Sucesso",
          description: "Paciente criado com sucesso!",
        });
      } else {
        toast({
          title: "Erro",
          description: result.error || "Falha ao criar paciente",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro inesperado",
        variant: "destructive"
      });
    }
  };

  const handleUpdatePatient = async (patientId: string, patientData: Partial<Patient>) => {
    try {
      const result = await PatientService.updatePatient(patientId, patientData);
      
      if (result.success) {
        await loadPatients();
        toast({
          title: "Sucesso",
          description: "Paciente atualizado com sucesso!",
        });
      } else {
        toast({
          title: "Erro",
          description: result.error || "Falha ao atualizar paciente",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro inesperado",
        variant: "destructive"
      });
    }
  };

  const handleDeletePatient = async (patientId: string) => {
    try {
      const result = await PatientService.deletePatient(patientId);
      
      if (result.success) {
        await loadPatients();
        toast({
          title: "Sucesso",
          description: "Paciente removido com sucesso!",
        });
      } else {
        toast({
          title: "Erro",
          description: result.error || "Falha ao remover paciente",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro inesperado",
        variant: "destructive"
      });
    }
  };

  const handleFilterChange = (newFilters: Partial<PatientFilters>) => {
    setFilters(prevFilters => ({ ...prevFilters, ...newFilters }));
  };

  const handleRetry = () => {
    loadPatients();
  };

  useEffect(() => {
    loadPatients();
  }, [user?.id, filters]);

  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  if (isLoading) {
    return <PatientLoadingState />;
  }

  if (error) {
    return <PatientErrorState errorMessage={error} onRetry={handleRetry} />;
  }

  return (
    <div>
      <PatientListHeader
        totalItems={totalPatients}
        filters={filters}
        onFilterChange={handleFilterChange}
      />
      <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {patients.map((patient) => (
          <PatientCard
            key={patient.id}
            patient={patient}
            onEdit={() => navigate(`/patients/${patient.id}`)}
            onDelete={() => handleDeletePatient(patient.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default Patients;
