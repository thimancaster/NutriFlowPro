
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, User, Plus, Calendar, Weight, Activity } from 'lucide-react';
import { usePatient } from '@/contexts/patient/PatientContext';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Patient } from '@/types';

interface ConsolidatedPatientSelectorProps {
  onPatientSelected: (patient: Patient) => void;
  preSelectedPatientId?: string;
}

const ConsolidatedPatientSelector: React.FC<ConsolidatedPatientSelectorProps> = ({
  onPatientSelected,
  preSelectedPatientId
}) => {
  const { patients, activePatient, startPatientSession, isLoading } = usePatient();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);

  // Auto-select patient if preSelectedPatientId is provided
  useEffect(() => {
    if (preSelectedPatientId && patients.length > 0) {
      const preSelectedPatient = patients.find(p => p.id === preSelectedPatientId);
      if (preSelectedPatient) {
        handlePatientSelect(preSelectedPatient);
      }
    }
  }, [preSelectedPatientId, patients]);

  // Filter patients based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredPatients(patients);
    } else {
      const filtered = patients.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPatients(filtered);
    }
  }, [searchTerm, patients]);

  const handlePatientSelect = async (patient: Patient) => {
    try {
      await startPatientSession(patient);
      onPatientSelected(patient);
      
      toast({
        title: 'Paciente Selecionado',
        description: `Atendimento de ${patient.name} iniciado`,
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao selecionar paciente',
        variant: 'destructive'
      });
    }
  };

  if (activePatient) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Paciente Selecionado
            </div>
            <Badge variant="default">Em Atendimento</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{activePatient.name}</h3>
                <p className="text-muted-foreground">{activePatient.email}</p>
                <div className="flex gap-2 mt-1">
                  {activePatient.birth_date && (
                    <Badge variant="outline" className="text-xs">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date().getFullYear() - new Date(activePatient.birth_date).getFullYear()} anos
                    </Badge>
                  )}
                  {activePatient.gender && (
                    <Badge variant="outline" className="text-xs">
                      {activePatient.gender === 'male' ? 'M' : 'F'}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
            >
              Trocar Paciente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Selecionar Paciente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar paciente por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Patient List */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-2">Carregando pacientes...</p>
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground">Nenhum paciente encontrado</p>
                <Button variant="outline" size="sm" className="mt-2">
                  <Plus className="h-4 w-4 mr-2" />
                  Cadastrar Novo Paciente
                </Button>
              </div>
            ) : (
              filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  className="p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => handlePatientSelect(patient)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{patient.name}</h4>
                        <p className="text-sm text-muted-foreground">{patient.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {patient.birth_date && (
                        <Badge variant="outline" className="text-xs">
                          {new Date().getFullYear() - new Date(patient.birth_date).getFullYear()}a
                        </Badge>
                      )}
                      {patient.gender && (
                        <Badge variant="outline" className="text-xs">
                          {patient.gender === 'male' ? 'M' : 'F'}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConsolidatedPatientSelector;
