
import React from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetFooter 
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { format, parseISO, differenceInYears } from 'date-fns';
import { Patient } from '@/types';
import PatientBasicInfo from './PatientBasicInfo';
import PatientAppointments from './PatientAppointments';
import PatientEvolution from './PatientEvolution';
import PatientEvaluations from './PatientEvaluations';
import PatientMealPlans from './PatientMealPlans';
import PatientNotes from './PatientNotes';

interface PatientDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  patient: Patient | null;
  isLoading: boolean;
}

const PatientDetailModal = ({ 
  isOpen, 
  onClose, 
  patientId, 
  patient, 
  isLoading 
}: PatientDetailModalProps) => {
  // Format date helper
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    try {
      return format(parseISO(dateStr), 'dd/MM/yyyy');
    } catch (e) {
      return dateStr;
    }
  };
  
  // Calculate age from birth_date
  const calculateAge = (birthDate: string | null) => {
    if (!birthDate) return null;
    try {
      return differenceInYears(new Date(), parseISO(birthDate));
    } catch (e) {
      return null;
    }
  };
  
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full md:max-w-[800px] sm:max-w-full overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold">
            {isLoading ? 'Carregando...' : patient?.name || 'Paciente não encontrado'}
          </SheetTitle>
        </SheetHeader>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nutri-blue"></div>
          </div>
        ) : patient ? (
          <Tabs defaultValue="dados" className="mt-6">
            <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-4">
              <TabsTrigger value="dados">Dados</TabsTrigger>
              <TabsTrigger value="agendamentos">Agendamentos</TabsTrigger>
              <TabsTrigger value="evolucao">Evolução</TabsTrigger>
              <TabsTrigger value="avaliacoes">Avaliações</TabsTrigger>
              <TabsTrigger value="planos">Planos</TabsTrigger>
              <TabsTrigger value="anotacoes">Anotações</TabsTrigger>
            </TabsList>
            
            <TabsContent value="dados">
              <PatientBasicInfo patient={patient} formatDate={formatDate} calculateAge={calculateAge} />
            </TabsContent>
            
            <TabsContent value="agendamentos">
              <PatientAppointments patientId={patientId} />
            </TabsContent>
            
            <TabsContent value="evolucao">
              <PatientEvolution patientId={patientId} />
            </TabsContent>
            
            <TabsContent value="avaliacoes">
              <PatientEvaluations patientId={patientId} />
            </TabsContent>
            
            <TabsContent value="planos">
              <PatientMealPlans patientId={patientId} />
            </TabsContent>
            
            <TabsContent value="anotacoes">
              <PatientNotes patient={patient} patientId={patientId} />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-8">
            <p className="text-lg text-red-600">Paciente não encontrado</p>
          </div>
        )}
        
        <SheetFooter className="mt-6">
          <Button onClick={onClose}>Fechar</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default PatientDetailModal;
