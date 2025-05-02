
import React from 'react';
import { differenceInYears } from 'date-fns';
import { useConsultation } from '@/contexts/ConsultationContext';
import { Button } from '@/components/ui/button';
import { AlertCircle, ChevronRight, User, X } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useNavigate } from 'react-router-dom';

interface ConsultationHeaderProps {
  currentStep?: 'consultation' | 'meal-plan' | 'summary';
}

const ConsultationHeader: React.FC<ConsultationHeaderProps> = ({ currentStep = 'consultation' }) => {
  const { activePatient, endConsultation, isConsultationActive } = useConsultation();
  const [showEndConfirmation, setShowEndConfirmation] = React.useState(false);
  const navigate = useNavigate();
  
  if (!isConsultationActive || !activePatient) {
    return null;
  }
  
  const calculateAge = (birthDate: string | null | undefined) => {
    if (!birthDate) return null;
    try {
      return differenceInYears(new Date(), new Date(birthDate));
    } catch (e) {
      return null;
    }
  };
  
  const age = calculateAge(activePatient.birth_date);
  const gender = activePatient.gender === 'male' ? 'Masculino' : activePatient.gender === 'female' ? 'Feminino' : '';
  
  const handleEndConsultation = () => {
    endConsultation();
    navigate('/patients');
    setShowEndConfirmation(false);
  };
  
  return (
    <>
      <div className="bg-white border-b shadow-sm mb-6">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-nutri-blue p-2 rounded-full">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="font-medium flex items-center">
                  Atendimento em andamento
                  <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                    Ativo
                  </span>
                </h2>
                <div className="text-sm text-gray-600 flex flex-wrap items-center gap-x-2">
                  <span className="font-medium text-nutri-blue">{activePatient.name}</span>
                  {age && <span>{age} anos</span>}
                  {gender && <span>• {gender}</span>}
                  {activePatient.goals?.objective && (
                    <span>• Objetivo: {activePatient.goals.objective}</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="hidden md:flex items-center text-sm text-gray-500 bg-gray-100 rounded-lg px-3 py-1">
                <Button
                  variant={currentStep === 'consultation' ? 'default' : 'ghost'}
                  size="sm"
                  className={currentStep === 'consultation' ? 'bg-nutri-blue text-white' : 'bg-transparent text-gray-500'}
                >
                  Consulta
                </Button>
                <ChevronRight className="h-4 w-4 mx-1" />
                <Button
                  variant={currentStep === 'meal-plan' ? 'default' : 'ghost'}
                  size="sm"
                  className={currentStep === 'meal-plan' ? 'bg-nutri-blue text-white' : 'bg-transparent text-gray-500'}
                >
                  Plano Alimentar
                </Button>
                <ChevronRight className="h-4 w-4 mx-1" />
                <Button
                  variant={currentStep === 'summary' ? 'default' : 'ghost'}
                  size="sm"
                  className={currentStep === 'summary' ? 'bg-nutri-blue text-white' : 'bg-transparent text-gray-500'}
                >
                  Resumo
                </Button>
              </div>
              
              <Button 
                variant="ghost" 
                size="icon"
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={() => setShowEndConfirmation(true)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <AlertDialog open={showEndConfirmation} onOpenChange={setShowEndConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertCircle className="h-6 w-6 text-red-500 mb-2" />
            <AlertDialogTitle>Encerrar Atendimento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja encerrar o atendimento atual? Os dados não salvos serão perdidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleEndConsultation} className="bg-red-500 hover:bg-red-600">
              Encerrar Atendimento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ConsultationHeader;
