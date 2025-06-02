
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth/AuthContext';
import { usePatient } from '@/contexts/patient/PatientContext';
import { ActivityLevel, Objective } from '@/types/consultation';

interface ExportData {
  weight: number;
  height: number;
  age: number;
  sex: 'M' | 'F';
  activityLevel: ActivityLevel;
  objective: Objective;
}

export const useENPExport = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { activePatient } = usePatient();
  
  const handleExportResults = useCallback((results: any, data: ExportData) => {
    if (!results) {
      toast({
        title: "Nenhum resultado",
        description: "Realize o cálculo ENP primeiro para exportar os resultados.",
        variant: "destructive"
      });
      return;
    }

    // Funcionalidade de exportação padrão
    const exportData = {
      system: 'ENP - Engenharia Nutricional Padrão',
      timestamp: new Date().toISOString(),
      patient: { 
        name: activePatient?.name || 'Paciente',
        weight: data.weight, 
        height: data.height, 
        age: data.age, 
        sex: data.sex 
      },
      parameters: { activityLevel: data.activityLevel, objective: data.objective },
      results: results,
      professional: user?.email || 'Nutricionista'
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `enp-calculo-${activePatient?.name || 'paciente'}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Exportação concluída",
      description: "Resultados ENP exportados com sucesso.",
    });
  }, [activePatient, user, toast]);

  return {
    handleExportResults
  };
};
