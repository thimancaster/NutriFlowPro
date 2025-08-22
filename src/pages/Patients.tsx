import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatientList } from '@/hooks/patient/usePatientList';
import { usePatientOperations } from '@/hooks/patient/usePatientOperations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { MoreVertical, Edit, Copy, Trash2, UserPlus } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Pagination } from '@/components/ui/pagination';
import { useDebounce } from '@/hooks/useDebounce';
import { useSearchParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Switch } from "@/components/ui/switch"
import { Link } from 'react-router-dom';
import { PatientFilters as TypedPatientFilters } from '@/types/patient';

const Patients: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const {
    patients,
    isLoading,
    error,
    handleSearch,
    handlePageChange,
    handleFilterChange: handleFilterChangeInternal,
    handleStatusChange,
    refetch,
    pagination,
    searchTerm,
    filters,
    setCurrentPage,
    setSearchTerm,
  } = usePatientList();
  const { deletePatient, duplicatePatient } = usePatientOperations();
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const handleCreate = () => {
    navigate('/patients/new');
  };

  const handleEdit = (id: string) => {
    navigate(`/patients/${id}`);
  };

  const handleDuplicate = async (patient: any) => {
    try {
      await duplicatePatient(patient);
      toast({
        title: "Paciente Duplicado",
        description: "Paciente duplicado com sucesso.",
      });
      await refetch();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao duplicar paciente.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (selectedPatientId) {
      try {
        await deletePatient(selectedPatientId);
        toast({
          title: "Paciente Removido",
          description: "Paciente removido com sucesso.",
        });
        await refetch();
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao remover paciente.",
          variant: "destructive",
        });
      } finally {
        setShowDeleteDialog(false);
        setSelectedPatientId(null);
      }
    }
  };

  const confirmDelete = (id: string) => {
    setSelectedPatientId(id);
    setShowDeleteDialog(true);
  };

  const handleFilterChange = useCallback((newFilters: Partial<TypedPatientFilters>) => {
    const mappedFilters = {
      ...newFilters,
      status: newFilters.status as '' | 'active' | 'archived' || ''
    };
    handleFilterChangeInternal(mappedFilters);
  }, [handleFilterChangeInternal]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (debouncedSearchTerm) {
      params.set('search', debouncedSearchTerm);
    } else {
      params.delete('search');
    }
    setSearchParams(params);
  }, [debouncedSearchTerm, setSearchParams, searchParams]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <p>Carregando pacientes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    const errorMessage = typeof error === 'string' ? error : (error as Error)?.message || 'Erro desconhecido';
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <p className="text-red-600">{errorMessage}</p>
        </div>
      </div>
    );
  }

  const finalFilters: TypedPatientFilters = {
    ...filters,
    status: filters.status as '' | 'active' | 'archived' || ''
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Pacientes</h1>
        <Button onClick={handleCreate} className="space-x-2">
          <UserPlus className="h-4 w-4" />
          <span>Adicionar Paciente</span>
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <div className="md:col-span-2">
          <Input
            type="search"
            placeholder="Buscar paciente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Label htmlFor="status">Status:</Label>
          <select
            id="status"
            className="border p-2 rounded"
            value={finalFilters.status}
            onChange={(e) => handleFilterChange({ status: e.target.value as '' | 'active' | 'archived' })}
          >
            <option value="">Todos</option>
            <option value="active">Ativos</option>
            <option value="archived">Arquivados</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableCaption>Lista de pacientes cadastrados.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.map((patient) => (
              <TableRow key={patient.id}>
                <TableCell className="font-medium">{patient.name}</TableCell>
                <TableCell>{patient.email}</TableCell>
                <TableCell>{patient.phone}</TableCell>
                <TableCell>
                  <Badge variant={patient.status === 'active' ? 'default' : 'secondary'}>
                    {patient.status === 'active' ? 'Ativo' : 'Arquivado'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menu</span>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Ações</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleEdit(patient.id)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(patient)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => confirmDelete(patient.id)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remover
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {patients.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center">Nenhum paciente encontrado.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-center mt-4">
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação irá remover o paciente permanentemente. Tem certeza que deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Remover</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Patients;
