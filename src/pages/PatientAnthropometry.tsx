
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import AnthropometryForm from '@/components/Anthropometry/AnthropometryForm';
import AnthropometryHistory from '@/components/Anthropometry/AnthropometryHistory';
import { BackButton } from '@/components/ui/back-button';
import Navbar from '@/components/Navbar';

const PatientAnthropometry = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatient = async () => {
      if (!patientId) return;
      
      try {
        const { data, error } = await supabase
          .from('patients')
          .select('*')
          .eq('id', patientId)
          .single();
        
        if (error) throw error;
        setPatient(data);
      } catch (error: any) {
        console.error('Error fetching patient:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados do paciente.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchPatient();
  }, [patientId, toast]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p>Carregando...</p>
        </div>
      </>
    );
  }

  if (!patient) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-2">Paciente não encontrado</h1>
            <p className="mb-4">Não foi possível encontrar o paciente solicitado.</p>
            <Button onClick={() => navigate('/patients')}>
              Voltar para lista de pacientes
            </Button>
          </div>
        </div>
      </>
    );
  }

  // Calculate age from birth_date
  let age = null;
  if (patient.birth_date) {
    const birthDate = new Date(patient.birth_date);
    const today = new Date();
    age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start mb-4">
            <div className="flex items-center gap-4">
              <BackButton to={`/patient-history/${patientId}`} />
              <div>
                <h1 className="text-3xl font-bold text-nutri-blue mb-1">{patient.name}</h1>
                <p className="text-gray-600">
                  {age ? `${age} anos` : ''}{patient.gender ? ` • ${patient.gender === 'female' ? 'Feminino' : 'Masculino'}` : ''}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="form" className="bg-white rounded-xl shadow-lg p-6">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="form">
              Nova avaliação
            </TabsTrigger>
            <TabsTrigger value="history">
              Histórico e Gráficos
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="form">
            <AnthropometryForm 
              patientId={patientId || ''} 
              patientName={patient.name}
              patientAge={age || 30}
              patientGender={patient.gender || 'female'}
            />
          </TabsContent>
          
          <TabsContent value="history">
            <AnthropometryHistory patientId={patientId || ''} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default PatientAnthropometry;
