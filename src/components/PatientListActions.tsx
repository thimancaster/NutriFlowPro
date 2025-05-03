
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileText, User } from 'lucide-react';
import { useConsultation } from '@/contexts/ConsultationContext';
import { Patient } from '@/types';

interface PatientListActionsProps {
  patient: Patient;
}

const PatientListActions: React.FC<PatientListActionsProps> = ({ patient }) => {
  const navigate = useNavigate();
  const { startConsultation } = useConsultation();
  
  const handleViewHistory = () => {
    navigate(`/patient-history/${patient.id}`);
  };
  
  const handleStartConsultation = () => {
    startConsultation(patient);
  };
  
  return (
    <div className="flex space-x-2">
      <Button 
        variant="ghost" 
        className="h-8 px-2 text-nutri-blue hover:text-nutri-blue-dark hover:bg-blue-50"
        onClick={handleViewHistory}
      >
        <FileText className="h-3 w-3 mr-1" /> Ver histórico
      </Button>
      <Button 
        variant="ghost" 
        className="h-8 px-2 text-nutri-green hover:text-nutri-green-dark hover:bg-green-50"
        onClick={handleStartConsultation}
      >
        <User className="h-3 w-3 mr-1" /> Nova consulta
      </Button>
    </div>
  );
};

export default PatientListActions;
