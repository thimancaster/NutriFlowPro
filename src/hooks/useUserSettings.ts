
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth/AuthContext';
import { UserSettings, NotificationPreferences, BusinessSettings } from '@/types/settings';
import { useToast } from '@/hooks/use-toast';

export const useUserSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchSettings = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        // Type cast the JSON fields to the expected types using unknown first
        const typedSettings: UserSettings = {
          ...data,
          settings: data.settings as unknown as Record<string, any>,
          notification_preferences: data.notification_preferences as unknown as NotificationPreferences,
          business_settings: data.business_settings as unknown as BusinessSettings,
          professional_settings: data.professional_settings as unknown as any,
        };
        setSettings(typedSettings);
      } else {
        // Create default settings if none exist
        const defaultSettings = {
          user_id: user.id,
          settings: {},
          notification_preferences: {
            email_reminders: true,
            sms_reminders: false,
            appointment_confirmations: true,
            payment_notifications: true,
            marketing_emails: false
          },
          business_settings: {
            clinic_address: '',
            clinic_phone: '',
            clinic_website: '',
            consultation_fee: 0,
            payment_methods: ['cash', 'card', 'pix'],
            cancellation_policy: '24h',
            auto_confirm_appointments: false
          },
          professional_settings: {
            workingHours: {
              monday: { start: '09:00', end: '18:00' },
              tuesday: { start: '09:00', end: '18:00' },
              wednesday: { start: '09:00', end: '18:00' },
              thursday: { start: '09:00', end: '18:00' },
              friday: { start: '09:00', end: '18:00' }
            },
            notifications: {
              newPatients: true,
              progressUpdates: true,
              consultationReminders: true
            },
            consultationDuration: 60
          }
        };

        const { data: newData, error: insertError } = await supabase
          .from('user_settings')
          .insert(defaultSettings)
          .select()
          .single();

        if (insertError) throw insertError;
        
        const typedNewSettings: UserSettings = {
          ...newData,
          settings: newData.settings as unknown as Record<string, any>,
          notification_preferences: newData.notification_preferences as unknown as NotificationPreferences,
          business_settings: newData.business_settings as unknown as BusinessSettings,
          professional_settings: newData.professional_settings as unknown as any,
        };
        setSettings(typedNewSettings);
      }

      setError(null);
    } catch (err) {
      console.error('Error fetching user settings:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch settings'));
    } finally {
      setIsLoading(false);
    }
  };

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

      const typedData: UserSettings = {
        ...data,
        settings: data.settings as unknown as Record<string, any>,
        notification_preferences: data.notification_preferences as unknown as NotificationPreferences,
        business_settings: data.business_settings as unknown as BusinessSettings,
        professional_settings: data.professional_settings as unknown as any,
      };
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

      const typedData: UserSettings = {
        ...data,
        settings: data.settings as unknown as Record<string, any>,
        notification_preferences: data.notification_preferences as unknown as NotificationPreferences,
        business_settings: data.business_settings as unknown as BusinessSettings,
        professional_settings: data.professional_settings as unknown as any,
      };
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

  useEffect(() => {
    if (user?.id) {
      fetchSettings();
    }
  }, [user?.id]);

  return {
    settings,
    isLoading,
    isSaving,
    error,
    updateNotificationPreferences,
    updateBusinessSettings,
    refetch: fetchSettings
  };
};
