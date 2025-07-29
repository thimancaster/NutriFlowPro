
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUnifiedEcosystem } from '@/contexts/UnifiedEcosystemContext';
import { usePatient } from '@/contexts/patient/PatientContext';
import { Users, Search, Plus } from 'lucide-react';

const PatientSelectionStep: React.FC = () => {
  const { patients, isLoading: patientsLoading } = usePatient();
  const { setActivePatient, setCurrentStep } = useUnifiedEcosystem();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectPatient = (patient: any) => {
    setActivePatient(patient);
    setCurrentStep('calculation');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-nutri-green" />
          Selecionar Paciente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar paciente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {patientsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nutri-green mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Carregando pacientes...</p>
          </div>
        ) : filteredPatients.length > 0 ? (
          <div className="space-y-2">
            {filteredPatients.map((patient) => (
              <div
                key={patient.id}
                className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                onClick={() => handleSelectPatient(patient)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{patient.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {patient.age ? `${patient.age} anos` : 'Idade não informada'} • 
                      {patient.gender ? ` ${patient.gender}` : ' Sexo não informado'}
                    </p>
                  </div>
                  <Button size="sm">
                    Selecionar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 space-y-4">
            <div className="text-muted-foreground">
              {searchTerm ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado'}
            </div>
            <Button className="bg-nutri-green hover:bg-nutri-green-dark">
              <Plus className="mr-2 h-4 w-4" />
              Cadastrar Novo Paciente
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PatientSelectionStep;
