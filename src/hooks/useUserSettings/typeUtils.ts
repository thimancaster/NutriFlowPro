
import { UserSettings, NotificationPreferences, BusinessSettings } from '@/types/settings';

export const castToUserSettings = (data: any): UserSettings => {
  return {
    ...data,
    settings: data.settings as unknown as Record<string, any>,
    notification_preferences: data.notification_preferences as unknown as NotificationPreferences,
    business_settings: data.business_settings as unknown as BusinessSettings,
    professional_settings: data.professional_settings as unknown as any,
  };
};
