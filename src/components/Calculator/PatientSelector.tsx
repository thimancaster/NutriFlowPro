
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, UserPlus } from 'lucide-react';
import { usePatient } from '@/contexts/patient/PatientContext';
import { Patient } from '@/types';

const PatientSelector: React.FC = () => {
  const { patients, activePatient, setActivePatient, isLoading } = usePatient();

  const handlePatientSelect = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      setActivePatient(patient);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando pacientes...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Selecionar Paciente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {patients.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">Nenhum paciente cadastrado</p>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Cadastrar Primeiro Paciente
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Select
              value={activePatient?.id || ''}
              onValueChange={handlePatientSelect}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um paciente" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {activePatient && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-800">{activePatient.name}</span>
                </div>
                <p className="text-sm text-blue-600 mt-1">
                  {activePatient.email || activePatient.phone || 'Sem contato'}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PatientSelector;
