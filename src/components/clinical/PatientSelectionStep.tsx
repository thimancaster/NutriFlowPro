
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePatientOptions } from '@/hooks/usePatientOptions';
import { useClinical } from '@/contexts/ClinicalContext';
import { Patient } from '@/types';

const PatientSelectionStep: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: patients, isLoading } = usePatientOptions();
  const { startNewConsultation } = useClinical();
  const navigate = useNavigate();
  
  // Filter patients based on search query
  const filteredPatients = patients?.filter(patient => 
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (patient.email && patient.email.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];
  
  const handleSelectPatient = async (patient: Patient) => {
    await startNewConsultation(patient);
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Selecione um Paciente</CardTitle>
          <CardDescription>
            Selecione um paciente existente ou cadastre um novo para iniciar a consulta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Buscar paciente por nome ou email..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button onClick={() => navigate('/patients/new')} className="bg-nutri-green hover:bg-nutri-green-dark">
              <Plus className="h-4 w-4 mr-2" />
              Novo Paciente
            </Button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nutri-green"></div>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchQuery ? 
                "Nenhum paciente encontrado com esse termo. Tente outro termo ou cadastre um novo paciente." :
                "Nenhum paciente cadastrado. Cadastre um novo paciente para começar."}
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {filteredPatients.map(patient => (
                <div
                  key={patient.id}
                  className="flex items-center justify-between p-3 rounded-md border hover:border-nutri-green hover:bg-nutri-green/5 transition-colors cursor-pointer"
                  onClick={() => handleSelectPatient(patient as Patient)}
                >
                  <div>
                    <h3 className="font-medium">{patient.name}</h3>
                    <p className="text-sm text-gray-500">
                      {patient.email || 'Email não cadastrado'} •
                      {patient.age ? ` ${patient.age} anos` : ' Idade não informada'}
                    </p>
                  </div>
                  <Button size="sm" variant="ghost" className="text-nutri-green">
                    <UserCheck className="h-4 w-4 mr-2" />
                    Selecionar
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientSelectionStep;
