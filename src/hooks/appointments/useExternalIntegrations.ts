
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Appointment } from '@/types/appointment';

export interface WhatsAppConfig {
  enabled: boolean;
  apiKey?: string;
  phoneNumber?: string;
}

export interface GoogleCalendarConfig {
  enabled: boolean;
  clientId?: string;
  calendarId?: string;
}

export const useExternalIntegrations = () => {
  const [whatsappConfig, setWhatsappConfig] = useState<WhatsAppConfig>({ enabled: false });
  const [googleCalendarConfig, setGoogleCalendarConfig] = useState<GoogleCalendarConfig>({ enabled: false });
  const { toast } = useToast();

  const sendWhatsAppReminder = async (appointment: Appointment, message: string) => {
    if (!whatsappConfig.enabled || !whatsappConfig.apiKey) {
      toast({
        title: 'WhatsApp não configurado',
        description: 'Configure a integração com WhatsApp nas configurações',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Simulate WhatsApp API call
      console.log('Sending WhatsApp reminder:', { appointment, message });
      
      // In a real implementation, you would make an API call to WhatsApp Business API
      // const response = await fetch('https://api.whatsapp.com/send', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${whatsappConfig.apiKey}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     to: appointment.patient_phone,
      //     message: message
      //   })
      // });

      toast({
        title: 'Lembrete Enviado',
        description: `Mensagem WhatsApp enviada para ${appointment.patientName}`,
      });
    } catch (error) {
      toast({
        title: 'Erro no WhatsApp',
        description: 'Não foi possível enviar a mensagem',
        variant: 'destructive',
      });
    }
  };

  const syncWithGoogleCalendar = async (appointment: Appointment) => {
    if (!googleCalendarConfig.enabled || !googleCalendarConfig.clientId) {
      toast({
        title: 'Google Calendar não configurado',
        description: 'Configure a integração com Google Calendar nas configurações',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Simulate Google Calendar API call
      console.log('Syncing with Google Calendar:', appointment);
      
      // In a real implementation, you would use Google Calendar API
      // const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${googleAccessToken}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     summary: `Consulta - ${appointment.patientName}`,
      //     start: {
      //       dateTime: appointment.start_time,
      //       timeZone: 'America/Sao_Paulo'
      //     },
      //     end: {
      //       dateTime: appointment.end_time,
      //       timeZone: 'America/Sao_Paulo'
      //     }
      //   })
      // });

      toast({
        title: 'Sincronizado',
        description: 'Agendamento adicionado ao Google Calendar',
      });
    } catch (error) {
      toast({
        title: 'Erro na Sincronização',
        description: 'Não foi possível sincronizar com Google Calendar',
        variant: 'destructive',
      });
    }
  };

  const configureWhatsApp = (config: WhatsAppConfig) => {
    setWhatsappConfig(config);
    localStorage.setItem('whatsapp_config', JSON.stringify(config));
  };

  const configureGoogleCalendar = (config: GoogleCalendarConfig) => {
    setGoogleCalendarConfig(config);
    localStorage.setItem('google_calendar_config', JSON.stringify(config));
  };

  // Load configurations from localStorage
  React.useEffect(() => {
    const savedWhatsAppConfig = localStorage.getItem('whatsapp_config');
    const savedGoogleCalendarConfig = localStorage.getItem('google_calendar_config');
    
    if (savedWhatsAppConfig) {
      setWhatsappConfig(JSON.parse(savedWhatsAppConfig));
    }
    
    if (savedGoogleCalendarConfig) {
      setGoogleCalendarConfig(JSON.parse(savedGoogleCalendarConfig));
    }
  }, []);

  return {
    whatsappConfig,
    googleCalendarConfig,
    sendWhatsAppReminder,
    syncWithGoogleCalendar,
    configureWhatsApp,
    configureGoogleCalendar
  };
};
