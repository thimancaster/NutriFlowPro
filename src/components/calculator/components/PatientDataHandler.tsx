import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { PatientService } from '@/services/patient';
import { consultationHistoryService } from '@/services/consultationHistoryService';
import { Patient } from '@/types';
import PatientHistoryLoader from './PatientHistoryLoader';

interface PatientDataHandlerProps {
  selectedPatient: Patient | null;
  patientName: string;
  setPatientName: (name: string) => void;
  weight: string;
  setWeight: (weight: string) => void;
  height: string;
  setHeight: (height: string) => void;
  age: string;
  setAge: (age: string) => void;
  gender: 'male' | 'female';
  setGender: (gender: 'male' | 'female') => void;
  activityLevel: string;
  setActivityLevel: (level: string) => void;
  objective: string;
  setObjective: (objective: string) => void;
  consultationType: string;
  setConsultationType: (type: 'primeira_consulta' | 'retorno') => void;
  children: React.ReactNode;
}

const PatientDataHandler: React.FC<PatientDataHandlerProps> = ({
  selectedPatient,
  patientName,
  setPatientName,
  weight,
  setWeight,
  height,
  setHeight,
  age,
  setAge,
  gender,
  setGender,
  activityLevel,
  setActivityLevel,
  objective,
  setObjective,
  consultationType,
  setConsultationType,
  children
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoadingPatientData, setIsLoadingPatientData] = useState(false);

  // Carregar dados básicos do paciente quando selecionado
  useEffect(() => {
    if (selectedPatient) {
      setIsLoadingPatientData(true);
      
      // Carregar dados básicos do paciente
      setPatientName(selectedPatient.name);
      
      // Calcular idade se tem data de nascimento
      if (selectedPatient.birth_date) {
        const birthDate = new Date(selectedPatient.birth_date);
        const today = new Date();
        const calculatedAge = today.getFullYear() - birthDate.getFullYear();
        setAge(calculatedAge.toString());
      }

      // Carregar gênero se disponível
      if (selectedPatient.gender) {
        setGender(selectedPatient.gender as 'male' | 'female');
      }

      console.log(`Paciente selecionado: ${selectedPatient.name} (ID: ${selectedPatient.id})`);
      setIsLoadingPatientData(false);
    } else {
      // Limpar dados quando não há paciente selecionado
      setPatientName('');
      setWeight('');
      setHeight('');
      setAge('');
      setGender('female');
      setActivityLevel('sedentario');
      setObjective('manutenção');
      setConsultationType('primeira_consulta');
    }
  }, [selectedPatient]);

  // Função para salvar consulta no histórico
  const saveConsultationToHistory = async (calculationData: {
    bmr: number;
    tdee: number;
    macros: {
      protein: { grams: number; kcal: number };
      carbs: { grams: number; kcal: number };
      fat: { grams: number; kcal: number };
    };
  }) => {
    if (!selectedPatient || !user) {
      console.warn('Cannot save consultation: missing patient or user');
      return false;
    }

    try {
      const consultationData = {
        patient_id: selectedPatient.id,
        user_id: user.id,
        weight: parseFloat(weight),
        height: parseFloat(height),
        age: parseInt(age),
        sex: gender === 'male' ? 'M' as const : 'F' as const,
        body_profile: 'eutrofico',
        activity_level: activityLevel,
        objective: objective,
        tmb: calculationData.bmr,
        get: calculationData.tdee,
        vet: calculationData.tdee,
        protein_g: calculationData.macros.protein.grams,
        carbs_g: calculationData.macros.carbs.grams,
        fat_g: calculationData.macros.fat.grams,
        protein_kcal: calculationData.macros.protein.kcal,
        carbs_kcal: calculationData.macros.carbs.kcal,
        fat_kcal: calculationData.macros.fat.kcal,
        formula_used: 'Harris-Benedict',
        notes: `Consulta realizada em ${new Date().toLocaleDateString('pt-BR')}`
      };

      const success = await consultationHistoryService.saveConsultation(consultationData);
      
      if (success) {
        toast({
          title: 'Sucesso',
          description: 'Consulta salva no histórico do paciente',
          variant: 'default'
        });
        console.log('Consultation saved to history successfully');
      } else {
        toast({
          title: 'Aviso',
          description: 'Não foi possível salvar no histórico, mas os cálculos foram realizados',
          variant: 'default'
        });
      }

      return success;
    } catch (error) {
      console.error('Error saving consultation to history:', error);
      return false;
    }
  };

  // Função para carregar dados históricos
  const handleHistoryDataLoaded = (data: {
    weight: string;
    height: string;
    age: string;
    gender: 'male' | 'female';
    activityLevel: string;
    objective: string;
    consultationType: 'primeira_consulta' | 'retorno';
  }) => {
    console.log('Carregando dados históricos:', data);
    
    // Só carregar se os campos estão vazios (não sobrescrever entrada manual)
    if (!weight && data.weight) setWeight(data.weight);
    if (!height && data.height) setHeight(data.height);
    if (!age && data.age) setAge(data.age);
    if (data.gender) setGender(data.gender);
    if (data.activityLevel) setActivityLevel(data.activityLevel);
    if (data.objective) setObjective(data.objective);
    setConsultationType(data.consultationType);

    toast({
      title: 'Dados Carregados',
      description: `Dados da ${data.consultationType === 'primeira_consulta' ? 'primeira consulta' : 'consulta anterior'} foram carregados. Você pode editá-los conforme necessário.`,
      variant: 'default'
    });
  };

  return (
    <div>
      {/* Componente para carregar histórico do paciente */}
      <PatientHistoryLoader 
        patientId={selectedPatient?.id}
        onDataLoaded={handleHistoryDataLoaded}
      />
      
      {/* Renderizar o conteúdo original */}
      {children}
    </div>
  );
};

export default PatientDataHandler;
