
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { UserSettings, NotificationPreferences } from '@/types/settings';
import { castToUserSettings } from './typeUtils';

export const useNotificationSettings = (
  settings: UserSettings | null,
  setSettings: (settings: UserSettings) => void
) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const updateNotificationPreferences = async (preferences: Partial<NotificationPreferences>) => {
    if (!user?.id || !settings) return;

    try {
      setIsSaving(true);
      const updatedPreferences = { ...settings.notification_preferences, ...preferences };
      
      const { data, error } = await supabase
        .from('user_settings')
        .update({ notification_preferences: updatedPreferences })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      const typedData = castToUserSettings(data);
      setSettings(typedData);
      
      toast({
        title: 'Sucesso',
        description: 'Preferências de notificação atualizadas!'
      });
    } catch (err) {
      console.error('Error updating notification preferences:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar as preferências.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    updateNotificationPreferences,
    isSaving
  };
};
