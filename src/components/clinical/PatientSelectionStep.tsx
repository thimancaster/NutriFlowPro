
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePatientOptions } from '@/hooks/usePatientOptions';
import { useClinical } from '@/contexts/ClinicalContext';
import { usePatient } from '@/contexts/patient/PatientContext';
import { Patient } from '@/types';

const PatientSelectionStep: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const { data: patients, isLoading } = usePatientOptions(searchQuery);
  const { startNewConsultation } = useClinical();
  const { loadPatientById } = usePatient();
  const navigate = useNavigate();
  
  // Patients are already filtered by the server-side query
  const filteredPatients = patients || [];
  
  const handleSelectPatient = async (selectedPatient: any) => {
    try {
      console.log('Selecionando paciente:', selectedPatient);
      setSelectedPatientId(selectedPatient.id);
      
      // First load the full patient data
      await loadPatientById(selectedPatient.id);
      
      // Convert PatientOption to Patient format
      const fullPatient: Patient = {
        id: selectedPatient.id,
        name: selectedPatient.name,
        email: selectedPatient.email || '',
        birth_date: selectedPatient.birth_date || null,
        age: selectedPatient.age || 0,
        gender: 'female', // Default, will be updated when full patient loads
        phone: '',
        address: '',
        cpf: '',
        notes: '',
        goals: {},
        status: 'active',
        user_id: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('Iniciando consulta com paciente:', fullPatient);
      await startNewConsultation(fullPatient);
      
    } catch (error) {
      console.error('Erro ao selecionar paciente:', error);
    }
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
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
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
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? 
                "Nenhum paciente encontrado com esse termo. Tente outro termo ou cadastre um novo paciente." :
                "Nenhum paciente cadastrado. Cadastre um novo paciente para começar."}
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {filteredPatients.map(patient => (
                <div
                  key={patient.id}
                  className={`flex items-center justify-between p-3 rounded-md border transition-colors cursor-pointer ${
                    selectedPatientId === patient.id 
                      ? 'border-nutri-green bg-nutri-green/10 text-nutri-green' 
                      : 'hover:border-nutri-green hover:bg-nutri-green/5'
                  }`}
                  onClick={() => handleSelectPatient(patient)}
                >
                  <div>
                    <h3 className={`font-medium ${selectedPatientId === patient.id ? 'text-nutri-green' : 'text-foreground'}`}>
                      {patient.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {patient.email || 'Email não cadastrado'} •
                      {patient.age ? ` ${patient.age} anos` : ' Idade não informada'}
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    variant={selectedPatientId === patient.id ? "default" : "ghost"} 
                    className={selectedPatientId === patient.id ? 'bg-nutri-green hover:bg-nutri-green-dark text-white' : 'text-nutri-green'}
                  >
                    <UserCheck className="h-4 w-4 mr-2" />
                    {selectedPatientId === patient.id ? 'Selecionado' : 'Selecionar'}
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
