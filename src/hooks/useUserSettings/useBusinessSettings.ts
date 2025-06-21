
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { UserSettings, BusinessSettings } from '@/types/settings';
import { castToUserSettings } from './typeUtils';

export const useBusinessSettings = (
  settings: UserSettings | null,
  setSettings: (settings: UserSettings) => void
) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const updateBusinessSettings = async (businessSettings: Partial<BusinessSettings>) => {
    if (!user?.id || !settings) return;

    try {
      setIsSaving(true);
      const updatedBusinessSettings = { ...settings.business_settings, ...businessSettings };
      
      const { data, error } = await supabase
        .from('user_settings')
        .update({ business_settings: updatedBusinessSettings })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      const typedData = castToUserSettings(data);
      setSettings(typedData);
      
      toast({
        title: 'Sucesso',
        description: 'Configurações da clínica atualizadas!'
      });
    } catch (err) {
      console.error('Error updating business settings:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar as configurações.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    updateBusinessSettings,
    isSaving
  };
};
