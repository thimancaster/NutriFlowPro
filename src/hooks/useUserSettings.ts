
import { useEffect } from 'react';
import { useSettingsFetch } from './useUserSettings/useSettingsFetch';
import { useNotificationSettings } from './useUserSettings/useNotificationSettings';
import { useBusinessSettings } from './useUserSettings/useBusinessSettings';
import { useAuth } from '@/contexts/auth/AuthContext';

export const useUserSettings = () => {
  const { user } = useAuth();
  const {
    settings,
    setSettings,
    isLoading,
    error,
    fetchSettings
  } = useSettingsFetch();

  const {
    updateNotificationPreferences,
    isSaving: isNotificationSaving
  } = useNotificationSettings(settings, setSettings);

  const {
    updateBusinessSettings,
    isSaving: isBusinessSaving
  } = useBusinessSettings(settings, setSettings);

  const isSaving = isNotificationSaving || isBusinessSaving;

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
