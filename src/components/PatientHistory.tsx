
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, CheckCircle, User, Ruler, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO, differenceInYears } from 'date-fns';

interface Patient {
  id: string;
  name: string;
  birth_date: string;
  gender: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
  goals: {
    objective?: string;
    profile?: string;
  } | null;
}

const PatientHistory = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchPatient = async () => {
      if (!patientId) return;

      try {
        const { data, error } = await supabase
          .from('patients')
          .select('*')
          .eq('id', patientId)
          .single();

        if (error) {
          throw new Error(error.message);
        }

        setPatient(data as Patient);
      } catch (error: any) {
        console.error("Error fetching patient:", error);
        toast({
          title: "Erro ao carregar paciente",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [patientId, toast]);
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-nutri-blue" />
        <p className="mt-4 text-nutri-blue">Carregando dados do paciente...</p>
      </div>
    );
  }

  if (!patientId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="mb-8 nutri-card border-none shadow-lg">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-xl text-red-600">Paciente inválido</p>
              <Button 
                className="mt-4"
                onClick={() => navigate('/patients')}
              >
                Voltar para lista de pacientes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="mb-8 nutri-card border-none shadow-lg">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-xl text-red-600">Paciente não encontrado</p>
              <Button 
                className="mt-4"
                onClick={() => navigate('/patients')}
              >
                Voltar para lista de pacientes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate age from birth_date
  let age = null;
  if (patient.birth_date) {
    try {
      const birthDate = parseISO(patient.birth_date);
      age = differenceInYears(new Date(), birthDate);
    } catch (e) {
      console.error("Error parsing birth date:", e);
    }
  }

  // Format date to display
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    try {
      return format(parseISO(dateStr), 'dd/MM/yyyy');
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-8 nutri-card border-none shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold">{patient.name}</CardTitle>
            <Button onClick={() => navigate('/patients')}>Voltar para Pacientes</Button>
          </div>
          <CardDescription>
            Histórico e informações do paciente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 mb-3">
            {age !== null && (
              <div className="bg-blue-50 rounded-full px-3 py-1 text-sm text-blue-700">
                {age} anos
              </div>
            )}
            {patient.gender && (
              <div className="bg-purple-50 rounded-full px-3 py-1 text-sm text-purple-700">
                {patient.gender === 'F' ? 'Feminino' : 'Masculino'}
              </div>
            )}
            {patient.goals?.objective && (
              <div className="bg-green-50 rounded-full px-3 py-1 text-sm text-green-700">
                <span className="font-medium">Objetivo:</span> {patient.goals.objective}
              </div>
            )}
            {patient.goals?.profile && (
              <div className="bg-amber-50 rounded-full px-3 py-1 text-sm text-amber-700">
                <span className="font-medium">Perfil:</span> {patient.goals.profile}
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="font-semibold">Email:</span> {patient.email || '-'}
            </div>
            <div>
              <span className="font-semibold">Telefone:</span> {patient.phone || '-'}
            </div>
            <div>
              <span className="font-semibold">Data de Nascimento:</span> {formatDate(patient.birth_date)}
            </div>
            <div>
              <span className="font-semibold">Gênero:</span> {patient.gender === 'F' ? 'Feminino' : 'Masculino'}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Consultas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-nutri-blue">
              <div className="bg-blue-100 p-2 rounded-full mr-3">
                <Calendar className="h-4 w-4 text-nutri-blue" />
              </div>
              <span>Agendar nova consulta</span>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate(`/consultation?patientId=${patientId}`)}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Plano Alimentar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-nutri-green">
              <div className="bg-green-100 p-2 rounded-full mr-3">
                <CheckCircle className="h-4 w-4 text-nutri-green" />
              </div>
              <span>Gerar novo plano alimentar</span>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Informações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-nutri-gray-dark">
              <div className="bg-gray-100 p-2 rounded-full mr-3">
                <User className="h-4 w-4 text-nutri-gray-dark" />
              </div>
              <span>Ver informações do paciente</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/patient-anthropometry/${patientId}`)}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Antropometria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-nutri-blue">
              <div className="bg-blue-100 p-2 rounded-full mr-3">
                <Ruler className="h-4 w-4 text-nutri-blue" />
              </div>
              <span>Avaliação Antropométrica</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="nutri-card border-none shadow-lg">
        <CardHeader>
          <CardTitle>Próximas Consultas</CardTitle>
          <CardDescription>Agendamentos futuros com o paciente</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Nenhuma consulta agendada.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientHistory;
