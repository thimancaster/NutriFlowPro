
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import PatientHeader from '@/components/Anthropometry/PatientHeader';
import ConsultationWizard from '@/components/Consultation/ConsultationWizard';
import { supabase } from '@/integrations/supabase/client';
import { useConsultation } from '@/contexts/ConsultationContext';
import { Patient } from '@/types';
import { getObjectiveFromGoals, calculateAge } from '@/utils/patientUtils';
import ConsultationForm from '@/components/Consultation/ConsultationForm';
import ConsultationResults from '@/components/Consultation/ConsultationResults';
import { useConsultationForm } from '@/hooks/useConsultationForm';

const Consultation = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { activePatient, setActivePatient, consultationData, setConsultationData } = useConsultation();
  
  const patientData = location.state?.patientData || activePatient;
  const repeatConsultation = location.state?.repeatConsultation;
  
  const [patient, setPatient] = useState<any>(null);
  
  // Initialize form with any repeat consultation data if available
  const initialFormData = repeatConsultation ? {
    weight: repeatConsultation.weight?.toString() || '',
    height: repeatConsultation.height?.toString() || '',
    sex: repeatConsultation.sex || 'M',
    objective: repeatConsultation.objective || 'manutenção',
    profile: repeatConsultation.profile || 'magro',
    activityLevel: repeatConsultation.activityLevel || 'moderado'
  } : {};
  
  const { formData, results, handleInputChange, handleSelectChange, setFormData } = useConsultationForm(initialFormData);
  
  // Fetch patient data if not available
  useEffect(() => {
    const fetchPatient = async () => {
      if (patientData) {
        setPatient(patientData);
        setActivePatient(patientData as Patient);
        
        if (patientData.birth_date) {
          const age = calculateAge(patientData.birth_date);
          
          setFormData(prev => ({ 
            ...prev, 
            age: age ? age.toString() : '',
            sex: patientData.gender === 'female' ? 'F' : 'M',
            objective: getObjectiveFromGoals(patientData.goals)
          }));
        }
        return;
      }
      
      const urlParams = new URLSearchParams(location.search);
      const patientId = urlParams.get('patientId');
      
      if (patientId) {
        try {
          const { data, error } = await supabase
            .from('patients')
            .select('*')
            .eq('id', patientId)
            .single();
          
          if (error) throw error;
          
          // Convert the raw data to a Patient type with correct goals structure
          const patientWithFormattedGoals: Patient = {
            ...data,
            goals: typeof data.goals === 'object' ? data.goals as any : { objective: 'manutenção' }
          };
          
          setPatient(patientWithFormattedGoals);
          setActivePatient(patientWithFormattedGoals);
          
          if (data.birth_date) {
            const age = calculateAge(data.birth_date);
            
            setFormData(prev => ({ 
              ...prev, 
              age: age ? age.toString() : '',
              sex: data.gender === 'female' ? 'F' : 'M',
              objective: getObjectiveFromGoals(data.goals)
            }));
          }
        } catch (error: any) {
          console.error('Error fetching patient:', error);
          toast({
            title: "Erro",
            description: "Não foi possível carregar os dados do paciente.",
            variant: "destructive"
          });
        }
      }
    };
    
    fetchPatient();
  }, [location, patientData, repeatConsultation, toast, setActivePatient, setFormData]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const consultationFormData = {
      ...formData,
      results
    };
    
    // Save consultation data to context
    setConsultationData(consultationFormData);
    
    toast({
      title: "Consulta salva com sucesso",
      description: "Os resultados foram calculados e estão prontos para gerar um plano alimentar.",
    });
    
    navigate('/meal-plan-generator');
  };
  
  const handleNext = () => {
    handleSubmit({ preventDefault: () => {} } as React.FormEvent);
  };
  
  const handleBack = () => {
    navigate('/patients');
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <ConsultationWizard 
          currentStep={1} 
          onNext={handleNext} 
          onBack={handleBack}
          canGoNext={formData.weight && formData.height && formData.age ? true : false}
          nextButtonLabel="Gerar Plano Alimentar"
        >
          <h1 className="text-3xl font-bold mb-6 text-nutri-blue">Nova Consulta</h1>
          
          {patient && (
            <PatientHeader 
              patientName={patient.name}
              patientAge={formData.age ? parseInt(formData.age) : undefined}
              patientGender={patient.gender}
              patientObjective={formData.objective}
            />
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <Card className="nutri-card shadow-lg border-none">
                <CardHeader>
                  <CardTitle>Dados da Consulta</CardTitle>
                </CardHeader>
                <CardContent>
                  <ConsultationForm 
                    formData={formData}
                    handleInputChange={handleInputChange}
                    handleSelectChange={handleSelectChange}
                    onSubmit={handleSubmit}
                  />
                </CardContent>
              </Card>
            </div>
            
            <div className="md:col-span-2">
              <Card className="nutri-card shadow-lg border-none">
                <CardHeader>
                  <CardTitle>Resultados do Cálculo</CardTitle>
                </CardHeader>
                <CardContent>
                  <ConsultationResults results={results} />
                </CardContent>
              </Card>
            </div>
          </div>
        </ConsultationWizard>
      </div>
    </div>
  );
};

export default Consultation;
