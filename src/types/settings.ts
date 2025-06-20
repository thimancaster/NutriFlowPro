
export interface NotificationPreferences {
  email_reminders: boolean;
  sms_reminders: boolean;
  appointment_confirmations: boolean;
  payment_notifications: boolean;
  marketing_emails: boolean;
}

export interface BusinessSettings {
  clinic_address: string;
  clinic_phone: string;
  clinic_website: string;
  consultation_fee: number;
  payment_methods: string[];
  cancellation_policy: string;
  auto_confirm_appointments: boolean;
}

export interface ProfessionalSettings {
  workingHours: {
    [key: string]: {
      start: string;
      end: string;
    };
  };
  notifications: {
    newPatients: boolean;
    progressUpdates: boolean;
    consultationReminders: boolean;
  };
  consultationDuration: number;
}

export interface UserSettings {
  id: string;
  user_id: string;
  settings: Record<string, any>;
  notification_preferences: NotificationPreferences;
  business_settings: BusinessSettings;
  professional_settings: ProfessionalSettings;
  created_at: string;
  updated_at: string;
}
