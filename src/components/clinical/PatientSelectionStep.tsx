import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Plus, Clock } from 'lucide-react';
import { usePatient } from '@/contexts/patient/PatientContext';
import { Patient } from '@/types';

interface PatientSelectionStepProps {
  onPatientSelected?: () => void;
}

const PatientSelectionStep: React.FC<PatientSelectionStepProps> = ({ onPatientSelected }) => {
  const { 
    patients, 
    activePatient, 
    startPatientSession,
    isLoading 
  } = usePatient();

  const handlePatientSelect = async (patient: Patient) => {
    await startPatientSession(patient);
    onPatientSelected?.();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-nutri-green" />
          Seleção de Paciente
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nutri-green"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {patients.map((patient) => (
              <div
                key={patient.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  activePatient?.id === patient.id
                    ? 'border-nutri-green bg-nutri-light'
                    : 'border-gray-200 hover:border-nutri-green'
                }`}
                onClick={() => handlePatientSelect(patient)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{patient.name}</h3>
                  {activePatient?.id === patient.id && (
                    <Badge className="bg-nutri-green text-white">Ativo</Badge>
                  )}
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>{patient.age ? `${patient.age} anos` : 'Idade não informada'}</p>
                  <p>{patient.gender === 'male' ? 'Masculino' : 'Feminino'}</p>
                  <div className="flex items-center gap-1 text-xs">
                    <Clock className="h-3 w-3" />
                    <span>Criado: {new Date(patient.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </div>
            ))}
            
            {patients.length === 0 && (
              <div className="col-span-full text-center py-8">
                <User className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 mb-4">Nenhum paciente encontrado</p>
                <Button className="bg-nutri-green hover:bg-nutri-green-dark">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Paciente
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PatientSelectionStep;
