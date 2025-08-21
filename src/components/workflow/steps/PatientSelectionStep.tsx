
import React from 'react';
import { usePatient } from '@/contexts/patient/PatientContext';
import { useConsultationData } from '@/contexts/ConsultationDataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Plus } from 'lucide-react';
import { Patient } from '@/types';

interface PatientSelectionStepProps {
  onPatientSelected: () => void;
}

export const PatientSelectionStep: React.FC<PatientSelectionStepProps> = ({
  onPatientSelected
}) => {
  const { 
    patients, 
    activePatient,
    startPatientSession,
    isLoading 
  } = usePatient();
  
  const { startNewConsultation } = useConsultationData();

  const handleSelectPatient = async (patient: Patient) => {
    try {
      // Iniciar sessão do paciente
      startPatientSession(patient);
      
      // Iniciar nova consulta
      await startNewConsultation(patient);
      
      // Notificar conclusão da etapa
      onPatientSelected();
    } catch (error) {
      console.error('Erro ao selecionar paciente:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p>Carregando pacientes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Seleção do Paciente</h2>
        <p className="text-muted-foreground">
          Escolha o paciente para iniciar o atendimento nutricional
        </p>
      </div>

      {activePatient ? (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <User className="h-8 w-8 text-green-600" />
                <div>
                  <p className="font-medium">{activePatient.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Paciente selecionado
                  </p>
                </div>
              </div>
              <Button onClick={onPatientSelected} className="bg-green-600 hover:bg-green-700">
                Continuar Atendimento
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {patients.map((patient) => (
            <Card key={patient.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <User className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium">{patient.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {patient.age && `${patient.age} anos`} • 
                        {patient.gender === 'male' ? ' Masculino' : ' Feminino'}
                      </p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleSelectPatient(patient)}
                  >
                    Selecionar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {patients.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum paciente cadastrado</h3>
            <p className="text-muted-foreground mb-4">
              Cadastre um paciente para iniciar o atendimento
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Cadastrar Paciente
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
