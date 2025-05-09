
import { CalculatorState } from '../types';
import { NavigateFunction } from 'react-router-dom';

export const handleSavePatient = async (
  calculatorState: CalculatorState,
  user: any,
  navigate: NavigateFunction,
  toast: any,
  setIsSavingPatient: (value: boolean) => void
): Promise<{ consultationId?: string } | undefined> => {
  if (!user) {
    toast({
      title: "Erro de autenticação",
      description: "Você precisa estar logado para cadastrar pacientes.",
      variant: "destructive"
    });
    return;
  }
  
  if (!calculatorState.patientName || !calculatorState.age) {
    toast({
      title: "Dados incompletos",
      description: "O nome do paciente e a idade são obrigatórios.",
      variant: "destructive"
    });
    return;
  }
  
  setIsSavingPatient(true);
  
  try {
    // Navigate to the patients/new page with data for registration
    navigate('/patients/new', {
      state: {
        newPatient: {
          name: calculatorState.patientName,
          gender: calculatorState.gender === 'male' ? 'M' : 'F',
          age: calculatorState.age,
          height: calculatorState.height,
          weight: calculatorState.weight,
          objective: calculatorState.objective
        }
      }
    });
    
    toast({
      title: "Redirecionando...",
      description: "Complete o cadastro do paciente para salvar os dados."
    });
    
    // Return a placeholder consultationId or undefined
    // In a real implementation, this would be an actual ID from the database
    return { consultationId: undefined };
  } catch (error) {
    console.error("Error navigating to patient registration:", error);
    toast({
      title: "Erro",
      description: "Não foi possível redirecionar para o cadastro de pacientes.",
      variant: "destructive"
    });
  } finally {
    setIsSavingPatient(false);
  }
  
  // Make sure we always return something of the expected type
  return { consultationId: undefined };
};
