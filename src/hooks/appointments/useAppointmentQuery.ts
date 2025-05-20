
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Appointment } from '@/types';

// Função para buscar as consultas
const fetchAppointments = async (userId?: string, patientId?: string) => {
  if (!userId) return [];
  
  // Inicia a construção da consulta
  let query = supabase
    .from('appointments')
    .select(`
      *,
      patients(name)
    `)
    .eq('user_id', userId);
  
  // Filtra por patient_id se fornecido
  if (patientId) {
    query = query.eq('patient_id', patientId);
  }
  
  // Ordena por data, mais recente primeiro
  query = query.order('date', { ascending: false });
  
  const { data, error } = await query;
  
  if (error) {
    throw error;
  }
  
  // Transforma os dados para incluir patientName
  return data.map((appt: any) => ({
    ...appt,
    patientName: appt.patients?.name
  })) as Appointment[];
};

// Hook para usar a consulta de agendamentos
export const useAppointmentQuery = (patientId?: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['appointments', user?.id, patientId],
    queryFn: () => fetchAppointments(user?.id, patientId),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false // Evita refetching automático ao focar na janela
  });
};

// Exportar um hook dedicado para consultas de pacientes
export const usePatientAppointments = (patientId: string) => {
  return useAppointmentQuery(patientId);
};

// Exportar um hook geral de consultas - sem filtragem por paciente
export const useAppointments = () => {
  return useAppointmentQuery();
};
