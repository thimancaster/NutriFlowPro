
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth/AuthContext';
import { UserSettings } from '@/types/settings';
import { castToUserSettings } from './typeUtils';

export const useSettingsFetch = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
        const typedSettings = castToUserSettings(data);
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
        
        const typedNewSettings = castToUserSettings(newData);
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

  return {
    settings,
    setSettings,
    isLoading,
    error,
    fetchSettings
  };
};
