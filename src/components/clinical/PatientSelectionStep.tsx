
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, UserCheck, Clock, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePatientOptions } from '@/hooks/usePatientOptions';
import { useConsultationData } from '@/contexts/ConsultationDataContext';
import { Patient } from '@/types';

const PatientSelectionStep: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const { data: patients, isLoading } = usePatientOptions(searchQuery);
  const { 
    setSelectedPatient, 
    startNewConsultation, 
    isLoading: contextLoading,
    selectedPatient 
  } = useConsultationData();
  const navigate = useNavigate();
  
  // Patients are already filtered by the server-side query
  const filteredPatients = patients || [];
  
  const handleSelectPatient = async (selectedPatient: any) => {
    try {
      console.log('Selecionando paciente para consulta integrada:', selectedPatient);
      setSelectedPatientId(selectedPatient.id);
      
      // Convert PatientOption to Patient format with available data
      const fullPatient: Patient = {
        id: selectedPatient.id,
        name: selectedPatient.name,
        email: selectedPatient.email || '',
        birth_date: selectedPatient.birth_date || null,
        age: selectedPatient.age || 0,
        gender: 'female', // Will be loaded from full patient data
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
      
      // Set patient in centralized context - this will auto-load historical data
      setSelectedPatient(fullPatient);
      
      // Start new consultation with complete integration
      await startNewConsultation(fullPatient);
      
      console.log('Consulta integrada iniciada com sucesso');
      
    } catch (error) {
      console.error('Erro ao iniciar consulta integrada:', error);
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
          
          {(isLoading || contextLoading) ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nutri-green"></div>
              <p className="text-sm text-muted-foreground">
                {contextLoading ? 'Carregando dados do paciente...' : 'Buscando pacientes...'}
              </p>
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
                  className={`flex items-start justify-between p-4 rounded-lg border transition-all duration-200 cursor-pointer group ${
                    selectedPatientId === patient.id 
                      ? 'border-nutri-green bg-nutri-green/10 shadow-md' 
                      : 'hover:border-nutri-green/50 hover:bg-nutri-green/5 hover:shadow-sm'
                  }`}
                  onClick={() => handleSelectPatient(patient)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-semibold ${selectedPatientId === patient.id ? 'text-nutri-green' : 'text-foreground'}`}>
                        {patient.name}
                      </h3>
                      {selectedPatientId === patient.id && (
                        <div className="h-1.5 w-1.5 rounded-full bg-nutri-green animate-pulse"></div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {patient.age ? `${patient.age} anos` : 'Idade não informada'}
                      </span>
                      {patient.email && (
                        <span className="truncate max-w-[200px]">
                          {patient.email}
                        </span>
                      )}
                    </div>
                    {selectedPatient?.id === patient.id && (
                      <div className="mt-2 text-xs text-nutri-green flex items-center gap-1">
                        <Activity className="h-3 w-3" />
                        Carregando dados históricos...
                      </div>
                    )}
                  </div>
                  <Button 
                    size="sm" 
                    variant={selectedPatientId === patient.id ? "default" : "ghost"} 
                    className={`transition-all duration-200 ${
                      selectedPatientId === patient.id 
                        ? 'bg-nutri-green hover:bg-nutri-green-dark text-white shadow-sm' 
                        : 'text-nutri-green hover:bg-nutri-green/10 opacity-0 group-hover:opacity-100'
                    }`}
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
