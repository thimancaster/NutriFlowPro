
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Patient } from '@/types/patient';
import { ConsultationData } from '@/types/consultation';
import { formatDate } from '@/utils/dateUtils';
import { ArrowLeft, Calendar, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface WorkflowHeaderProps {
  patient: Patient | null;
  consultation: ConsultationData | null;
  currentStep: string;
  onStepChange: (step: string) => void;
  onSave?: () => void;
  isSaving?: boolean;
  showBackButton?: boolean;
  showSaveButton?: boolean;
}

const WorkflowHeader: React.FC<WorkflowHeaderProps> = ({
  patient,
  consultation,
  currentStep,
  onStepChange,
  onSave,
  isSaving = false,
  showBackButton = true,
  showSaveButton = true,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (patient) {
      navigate(`/patients/${patient.id}`);
    } else {
      navigate('/patients');
    }
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              {showBackButton && (
                <Button variant="ghost" size="icon" onClick={handleBack}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <h2 className="text-2xl font-bold">
                {patient ? patient.name : 'Nova Consulta'}
              </h2>
            </div>
            {consultation && consultation.date && (
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <Calendar className="h-4 w-4 mr-1" />
                {formatDate(typeof consultation.date === 'string' ? consultation.date : consultation.date.toISOString())}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Tabs
              value={currentStep}
              onValueChange={onStepChange}
              className="w-full md:w-auto"
            >
              <TabsList className="grid grid-cols-2 md:grid-cols-3 w-full">
                <TabsTrigger value="evaluation">Avaliação</TabsTrigger>
                <TabsTrigger value="meal-plan">Plano Alimentar</TabsTrigger>
                <TabsTrigger value="review" className="hidden md:block">
                  Revisão
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {showSaveButton && onSave && (
              <Button onClick={onSave} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Salvando...' : 'Salvar'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkflowHeader;
