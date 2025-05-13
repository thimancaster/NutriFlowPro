import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { X, Pencil, Archive, RotateCcw, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Patient } from '@/types';

import PatientBasicInfo from './PatientBasicInfo';
import PatientAppointments from './PatientAppointments';
import PatientMealPlans from './PatientMealPlans';
import PatientEvaluations from './PatientEvaluations';
import PatientEvolution from './PatientEvolution';
import PatientNotes from './PatientNotes';
import { PatientService } from '@/services/patientService';
import { useToast } from '@/hooks/use-toast';

interface PatientDetailModalProps {
  patient: Patient | null;
  open: boolean;
  onClose: () => void;
  onStatusChange?: () => void;
}

const PatientDetailModal = ({ patient, open, onClose, onStatusChange }: PatientDetailModalProps) => {
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  if (!patient) return null;
  
  const handleEditClick = () => {
    navigate(`/patients/edit/${patient.id}`);
    onClose();
  };
  
  const handleArchiveClick = () => {
    setIsArchiveDialogOpen(true);
  };
  
  const handleReactivateClick = () => {
    setIsArchiveDialogOpen(true);
  };
  
  const handleStatusChange = async () => {
    if (!patient) return;
    
    setIsLoading(true);
    
    const newStatus = patient.status === 'active' ? 'archived' : 'active';
    
    try {
      const result = await PatientService.updatePatientStatus(patient.id, newStatus);
      
      if (result.success) {
        toast({
          title: newStatus === 'active' ? "Paciente reativado" : "Paciente arquivado",
          description: `${patient.name} foi ${newStatus === 'active' ? 'reativado(a)' : 'arquivado(a)'} com sucesso.`
        });
        
        if (onStatusChange) {
          onStatusChange();
        }
        
        onClose();
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: `Não foi possível ${newStatus === 'active' ? 'reativar' : 'arquivar'} o paciente. ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsArchiveDialogOpen(false);
    }
  };
  
  const handleNewAppointment = () => {
    // This will be implemented in the future
    toast({
      description: "Funcionalidade em desenvolvimento"
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl">{patient.name}</DialogTitle>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className={`inline-block h-3 w-3 rounded-full ${patient.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="text-sm text-gray-500">{patient.status === 'active' ? 'Ativo' : 'Arquivado'}</span>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleEditClick}>
                <Pencil className="h-4 w-4 mr-1" /> Editar
              </Button>
              
              {patient.status === 'active' ? (
                <Button variant="outline" size="sm" onClick={handleArchiveClick}>
                  <Archive className="h-4 w-4 mr-1" /> Arquivar
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={handleReactivateClick}>
                  <RotateCcw className="h-4 w-4 mr-1" /> Reativar
                </Button>
              )}
              
              <Button size="sm" onClick={handleNewAppointment}>
                <Clock className="h-4 w-4 mr-1" /> Novo Agendamento
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid grid-cols-6 mb-4">
              <TabsTrigger value="info">Dados Cadastrais</TabsTrigger>
              <TabsTrigger value="appointments">Consultas</TabsTrigger>
              <TabsTrigger value="meal-plans">Planos Alimentares</TabsTrigger>
              <TabsTrigger value="evaluations">Avaliações</TabsTrigger>
              <TabsTrigger value="evolution">Evolução</TabsTrigger>
              <TabsTrigger value="notes">Observações</TabsTrigger>
            </TabsList>
            
            <TabsContent value="info">
              <PatientBasicInfo patient={patient} />
            </TabsContent>
            
            <TabsContent value="appointments">
              <PatientAppointments patientId={patient.id} />
            </TabsContent>
            
            <TabsContent value="meal-plans">
              <PatientMealPlans patientId={patient.id} />
            </TabsContent>
            
            <TabsContent value="evaluations">
              <PatientEvaluations patientId={patient.id} />
            </TabsContent>
            
            <TabsContent value="evolution">
              <PatientEvolution patientId={patient.id} />
            </TabsContent>
            
            <TabsContent value="notes">
              <PatientNotes patientId={patient.id} notes={patient.notes} />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {patient.status === 'active' ? 'Arquivar paciente' : 'Reativar paciente'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {patient.status === 'active' 
                ? 'Tem certeza que deseja arquivar este paciente? Pacientes arquivados não aparecerão na listagem principal.'
                : 'Tem certeza que deseja reativar este paciente? Pacientes reativados voltarão a aparecer na listagem principal.'
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleStatusChange}
              disabled={isLoading}
              className={patient.status === 'active' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              {isLoading 
                ? 'Processando...' 
                : patient.status === 'active' ? 'Sim, arquivar' : 'Sim, reativar'
              }
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PatientDetailModal;
