
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Bell, Mail, MessageSquare, CreditCard, Megaphone } from 'lucide-react';
import { useUserSettings } from '@/hooks/useUserSettings';
import LoadingSpinner from '@/components/ui/loading-spinner';

const NotificationSettings: React.FC = () => {
  const { settings, isLoading, updateNotificationPreferences } = useUserSettings();

  if (isLoading) {
    return <LoadingSpinner text="Carregando configurações..." />;
  }

  if (!settings) {
    return <div>Erro ao carregar configurações</div>;
  }

  const { notification_preferences } = settings;

  const handleToggle = (key: keyof typeof notification_preferences) => {
    updateNotificationPreferences({
      [key]: !notification_preferences[key]
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notificações
        </CardTitle>
        <CardDescription>
          Configure como e quando você deseja receber notificações
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div className="space-y-1">
                <Label htmlFor="email_reminders">Lembretes por E-mail</Label>
                <p className="text-sm text-muted-foreground">
                  Receber lembretes de consultas por e-mail
                </p>
              </div>
            </div>
            <Switch
              id="email_reminders"
              checked={notification_preferences.email_reminders}
              onCheckedChange={() => handleToggle('email_reminders')}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <div className="space-y-1">
                <Label htmlFor="sms_reminders">Lembretes por SMS</Label>
                <p className="text-sm text-muted-foreground">
                  Receber lembretes de consultas por SMS
                </p>
              </div>
            </div>
            <Switch
              id="sms_reminders"
              checked={notification_preferences.sms_reminders}
              onCheckedChange={() => handleToggle('sms_reminders')}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <div className="space-y-1">
                <Label htmlFor="appointment_confirmations">Confirmações de Consulta</Label>
                <p className="text-sm text-muted-foreground">
                  Receber confirmações quando consultas forem agendadas
                </p>
              </div>
            </div>
            <Switch
              id="appointment_confirmations"
              checked={notification_preferences.appointment_confirmations}
              onCheckedChange={() => handleToggle('appointment_confirmations')}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <div className="space-y-1">
                <Label htmlFor="payment_notifications">Notificações de Pagamento</Label>
                <p className="text-sm text-muted-foreground">
                  Receber notificações sobre pagamentos e faturamento
                </p>
              </div>
            </div>
            <Switch
              id="payment_notifications"
              checked={notification_preferences.payment_notifications}
              onCheckedChange={() => handleToggle('payment_notifications')}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Megaphone className="h-4 w-4 text-muted-foreground" />
              <div className="space-y-1">
                <Label htmlFor="marketing_emails">E-mails Promocionais</Label>
                <p className="text-sm text-muted-foreground">
                  Receber informações sobre novos recursos e promoções
                </p>
              </div>
            </div>
            <Switch
              id="marketing_emails"
              checked={notification_preferences.marketing_emails}
              onCheckedChange={() => handleToggle('marketing_emails')}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
