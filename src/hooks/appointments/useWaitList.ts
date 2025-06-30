
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth/AuthContext';

export interface WaitListEntry {
  id: string;
  patient_id: string;
  patient_name: string;
  preferred_date?: string;
  preferred_time?: string;
  appointment_type: string;
  priority: 'low' | 'medium' | 'high';
  notes?: string;
  created_at: string;
  notified: boolean;
}

// Type-safe conversion for JSON storage
const convertWaitListToJson = (waitList: WaitListEntry[]): Record<string, any> => {
  return waitList.reduce((acc, entry, index) => {
    acc[`entry_${index}`] = {
      id: entry.id,
      patient_id: entry.patient_id,
      patient_name: entry.patient_name,
      preferred_date: entry.preferred_date,
      preferred_time: entry.preferred_time,
      appointment_type: entry.appointment_type,
      priority: entry.priority,
      notes: entry.notes,
      created_at: entry.created_at,
      notified: entry.notified
    };
    return acc;
  }, {} as Record<string, any>);
};

const convertJsonToWaitList = (json: any): WaitListEntry[] => {
  if (!json || typeof json !== 'object') return [];
  
  return Object.values(json).map((entry: any) => ({
    id: entry.id || '',
    patient_id: entry.patient_id || '',
    patient_name: entry.patient_name || '',
    preferred_date: entry.preferred_date,
    preferred_time: entry.preferred_time,
    appointment_type: entry.appointment_type || '',
    priority: entry.priority || 'medium',
    notes: entry.notes,
    created_at: entry.created_at || new Date().toISOString(),
    notified: entry.notified || false
  }));
};

export const useWaitList = () => {
  const [waitList, setWaitList] = useState<WaitListEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchWaitList = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('settings')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      const settingsData = data?.settings as any;
      const waitListData = settingsData?.wait_list ? convertJsonToWaitList(settingsData.wait_list) : [];
      setWaitList(waitListData);
    } catch (error) {
      console.error('Error fetching wait list:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToWaitList = async (entry: Omit<WaitListEntry, 'id' | 'created_at' | 'notified'>) => {
    if (!user?.id) return;

    try {
      const newEntry: WaitListEntry = {
        ...entry,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        notified: false
      };

      const updatedWaitList = [...waitList, newEntry];
      const waitListJson = convertWaitListToJson(updatedWaitList);

      await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          settings: { wait_list: waitListJson }
        });

      setWaitList(updatedWaitList);
      
      toast({
        title: 'Adicionado à Lista de Espera',
        description: `${entry.patient_name} foi adicionado à lista de espera`,
      });
    } catch (error) {
      console.error('Error adding to wait list:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar à lista de espera',
        variant: 'destructive',
      });
    }
  };

  const removeFromWaitList = async (entryId: string) => {
    if (!user?.id) return;

    try {
      const updatedWaitList = waitList.filter(entry => entry.id !== entryId);
      const waitListJson = convertWaitListToJson(updatedWaitList);

      await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          settings: { wait_list: waitListJson }
        });

      setWaitList(updatedWaitList);
      
      toast({
        title: 'Removido da Lista',
        description: 'Entrada removida da lista de espera',
      });
    } catch (error) {
      console.error('Error removing from wait list:', error);
    }
  };

  const notifyWaitListForSlot = async (date: string, time: string) => {
    const availableEntries = waitList.filter(entry => 
      !entry.notified && 
      (!entry.preferred_date || entry.preferred_date === date) &&
      (!entry.preferred_time || entry.preferred_time === time)
    );

    if (availableEntries.length > 0) {
      // Sort by priority and creation date
      const sortedEntries = availableEntries.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      });

      const topEntry = sortedEntries[0];
      
      toast({
        title: 'Lista de Espera',
        description: `${topEntry.patient_name} pode ser notificado sobre a vaga disponível`,
      });

      return topEntry;
    }

    return null;
  };

  useEffect(() => {
    fetchWaitList();
  }, [user?.id]);

  return {
    waitList,
    isLoading,
    addToWaitList,
    removeFromWaitList,
    notifyWaitListForSlot,
    refetch: fetchWaitList
  };
};
