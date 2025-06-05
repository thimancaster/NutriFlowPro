
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const usePatientData = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const updatePatientData = async (patientId: string, updateData: any) => {
    setIsLoading(true);
    try {
      // Extract the data we want to update
      const { weight, height, measurements } = updateData;
      
      // Prepare update object
      const patientUpdate: any = {
        updated_at: new Date().toISOString()
      };

      // Update measurements if provided
      if (measurements) {
        patientUpdate.measurements = measurements;
      }

      // Update the patient record
      const { error: patientError } = await supabase
        .from('patients')
        .update(patientUpdate)
        .eq('id', patientId);

      if (patientError) {
        throw patientError;
      }

      // If we have weight and height, also create a measurement record
      if (weight || height) {
        const measurementData = {
          patient_id: patientId,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          weight: weight ? Number(weight) : null,
          height: height ? Number(height) : null,
          measurement_date: new Date().toISOString(),
        };

        const { error: measurementError } = await supabase
          .from('measurements')
          .insert(measurementData);

        if (measurementError) {
          console.warn('Erro ao salvar medições:', measurementError);
          // Don't throw here, as patient update was successful
        }
      }

      toast({
        title: "Dados atualizados",
        description: "Informações do paciente foram atualizadas com sucesso.",
      });

    } catch (error: any) {
      console.error('Erro ao atualizar dados do paciente:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar os dados do paciente.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getPatientData = async (patientId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('patients')
        .select(`
          *,
          measurements (
            weight,
            height,
            measurement_date
          )
        `)
        .eq('id', patientId)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error: any) {
      console.error('Erro ao buscar dados do paciente:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do paciente.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updatePatientData,
    getPatientData,
    isLoading
  };
};

export default usePatientData;
