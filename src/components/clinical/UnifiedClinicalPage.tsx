import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, UserPlus, Activity, Clock, BarChart3 } from 'lucide-react';
import { useClinicalWorkflow } from '@/contexts/ClinicalWorkflowContext';
import { usePatientList } from '@/hooks/patient/usePatientList';
import PatientEvolutionChart from './PatientEvolutionChart';
import { Patient } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const UnifiedClinicalPage: React.FC = () => {
  const { state, startSession, setCurrentStep } = useClinicalWorkflow();
  const { patients, isLoading: patientsLoading, refetch: loadPatients } = usePatientList();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showEvolutionDialog, setShowEvolutionDialog] = useState(false);

  React.useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStartSession = async (patient: Patient) => {
    const session = await startSession(patient);
    if (session) {
      setCurrentStep('consultation-form');
      // Navigate to consultation form or handle as needed
      console.log('Session started:', session);
    }
  };

  const handleViewEvolution = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowEvolutionDialog(true);
  };

  const getPatientStatusBadge = (patient: Patient) => {
    switch (patient.status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Ativo</Badge>;
      case 'archived':
        return <Badge variant="secondary">Arquivado</Badge>;
      default:
        return <Badge variant="outline">Indefinido</Badge>;
    }
  };

  const calculateAge = (birthDate?: string): number | null => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1;
    }
    return age;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Atendimento Clínico</h1>
          <p className="text-muted-foreground">
            Gerencie seus pacientes e inicie sessões clínicas unificadas
          </p>
        </div>
        <Button variant="default" className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Novo Paciente
        </Button>
      </div>

      {/* Active Session Banner */}
      {state.activeSession && (
        <Card className="border-l-4 border-l-blue-500 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Sessão Ativa</p>
                <p className="text-sm text-muted-foreground">
                  {state.activePatient?.name} - {state.hasPrefilledData ? 'Acompanhamento' : 'Primeira Consulta'}
                </p>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  {state.currentStep}
                </Badge>
                <Button 
                  size="sm" 
                  onClick={() => setCurrentStep('consultation-form')}
                  disabled={state.isLoading}
                >
                  Continuar Sessão
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="patients" className="space-y-4">
        <TabsList>
          <TabsTrigger value="patients">Pacientes</TabsTrigger>
          <TabsTrigger value="recent">Sessões Recentes</TabsTrigger>
          <TabsTrigger value="analytics">Análises</TabsTrigger>
        </TabsList>

        <TabsContent value="patients">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Lista de Pacientes ({filteredPatients.length})</CardTitle>
                <div className="flex items-center gap-2 w-64">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar paciente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {patientsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted-foreground mt-2">Carregando pacientes...</p>
                </div>
              ) : filteredPatients.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    {searchTerm ? 'Nenhum paciente encontrado.' : 'Nenhum paciente cadastrado.'}
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredPatients.map(patient => (
                    <Card key={patient.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="font-semibold text-primary">
                                {patient.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-semibold">{patient.name}</h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>{patient.email || 'Sem email'}</span>
                                {patient.birth_date && (
                                  <>
                                    <span>•</span>
                                    <span>{calculateAge(patient.birth_date)} anos</span>
                                  </>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                {getPatientStatusBadge(patient)}
                                <Badge variant="outline" className="text-xs">
                                  {patient.gender || 'Não informado'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewEvolution(patient)}
                              className="flex items-center gap-1"
                            >
                              <BarChart3 className="h-4 w-4" />
                              Evolução
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleStartSession(patient)}
                              disabled={state.isLoading}
                              className="flex items-center gap-1"
                            >
                              <Activity className="h-4 w-4" />
                              {state.isLoading ? 'Iniciando...' : 'Iniciar Atendimento'}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Sessões Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p>Funcionalidade em desenvolvimento</p>
                <p className="text-sm">Em breve você poderá visualizar suas sessões recentes aqui.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Análises e Relatórios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p>Funcionalidade em desenvolvimento</p>
                <p className="text-sm">Em breve você terá acesso a análises e relatórios detalhados.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Evolution Chart Dialog */}
      <Dialog open={showEvolutionDialog} onOpenChange={setShowEvolutionDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Evolução do Paciente - {selectedPatient?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedPatient && (
            <PatientEvolutionChart 
              patientId={selectedPatient.id}
              patientName={selectedPatient.name}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UnifiedClinicalPage;