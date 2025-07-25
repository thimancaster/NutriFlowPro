import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useConsultationData } from '@/contexts/ConsultationDataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Calculator, FileText } from 'lucide-react';
import ConsultationFormWrapper from '@/components/Consultation/ConsultationFormWrapper';
import { useAuthState } from '@/hooks/useAuthState';

const ClinicalConsultation: React.FC = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthState();
  const { 
    selectedPatient, 
    consultationData, 
    updateConsultationData,
    setCurrentStep,
    isLoading 
  } = useConsultationData();

  // Redirect to clinical workflow if no patient is selected
  React.useEffect(() => {
    if (!selectedPatient && patientId) {
      navigate('/clinical');
    }
  }, [selectedPatient, patientId, navigate]);

  const handleBackToWorkflow = () => {
    setCurrentStep('nutritional-evaluation');
    navigate('/clinical');
  };

  const handleFormChange = (data: Partial<typeof consultationData>) => {
    updateConsultationData(data);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nutri-blue mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando consulta...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedPatient) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="p-6 text-center">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum Paciente Selecionado</h3>
            <p className="text-muted-foreground mb-4">
              Selecione um paciente no fluxo clínico para iniciar a consulta.
            </p>
            <Button onClick={() => navigate('/clinical')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Fluxo Clínico
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={handleBackToWorkflow}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Fluxo
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Consulta Nutricional</h1>
            <p className="text-muted-foreground">
              Paciente: {selectedPatient.name}
            </p>
          </div>
        </div>
      </div>

      {/* Integration Status */}
      <div className="mb-6">
        <Card className="border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
              <Calculator className="h-4 w-4" />
              <span className="font-medium">Fluxo Integrado Ativo</span>
            </div>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              Esta consulta está integrada ao fluxo clínico. Dados serão sincronizados automaticamente.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Consultation Content */}
      <div className="space-y-6">
        {consultationData ? (
          <ConsultationFormWrapper
            consultation={consultationData}
            onFormChange={handleFormChange}
            patient={selectedPatient}
            patients={[selectedPatient]} // Only current patient
            autoSaveStatus="idle"
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Nova Consulta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Inicie uma nova consulta para {selectedPatient.name} no fluxo clínico.
              </p>
              <Button 
                className="mt-4" 
                onClick={handleBackToWorkflow}
              >
                Iniciar Avaliação Nutricional
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ClinicalConsultation;