
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileText, User, Eye } from 'lucide-react';
import { useConsultation } from '@/contexts/ConsultationContext';
import { Patient } from '@/types';
import PatientStatusActions from './patient/PatientStatusActions';

interface PatientListActionsProps {
  patient: Patient;
  onViewDetail?: (patientId: string) => void;
  onStatusChange?: () => void;
}

const PatientListActions: React.FC<PatientListActionsProps> = ({ 
  patient, 
  onViewDetail,
  onStatusChange
}) => {
  const navigate = useNavigate();
  const { startConsultation } = useConsultation();
  
  const handleViewHistory = () => {
    navigate(`/patient-history/${patient.id}`);
  };
  
  const handleStartConsultation = () => {
    startConsultation(patient);
  };
  
  const handleViewDetail = () => {
    if (onViewDetail) {
      onViewDetail(patient.id);
    }
  };
  
  return (
    <div className="flex space-x-2">
      <Button 
        variant="ghost" 
        className="h-8 px-2 text-nutri-blue hover:text-nutri-blue-dark hover:bg-blue-50"
        onClick={handleViewDetail}
      >
        <Eye className="h-3 w-3 mr-1" /> Ver
      </Button>
      <Button 
        variant="ghost" 
        className="h-8 px-2 text-nutri-blue hover:text-nutri-blue-dark hover:bg-blue-50"
        onClick={handleViewHistory}
      >
        <FileText className="h-3 w-3 mr-1" /> Histórico
      </Button>
      <Button 
        variant="ghost" 
        className="h-8 px-2 text-nutri-green hover:text-nutri-green-dark hover:bg-green-50"
        onClick={handleStartConsultation}
      >
        <User className="h-3 w-3 mr-1" /> Consulta
      </Button>
      <PatientStatusActions 
        patient={patient} 
        onStatusChange={onStatusChange}
      />
    </div>
  );
};

export default PatientListActions;
