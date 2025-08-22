import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Calendar, Clock } from 'lucide-react'; // Changed Warning to AlertTriangle
import { Patient } from '@/types';

interface PatientAlertsProps {
  patient: Patient;
}

const PatientAlerts: React.FC<PatientAlertsProps> = ({ patient }) => {
  const alerts = [];

  // Check for missing basic information
  if (!patient.phone) {
    alerts.push({
      type: 'warning' as const,
      message: 'Telefone não cadastrado',
      icon: AlertTriangle // Changed from Warning
    });
  }

  if (!patient.email) {
    alerts.push({
      type: 'warning' as const,
      message: 'Email não cadastrado',
      icon: AlertTriangle
    });
  }

  // Check for upcoming appointments
  if (!patient.last_appointment) {
    alerts.push({
      type: 'info' as const,
      message: 'Nenhuma consulta agendada',
      icon: Calendar
    });
  } else {
    const lastAppointmentDate = new Date(patient.last_appointment);
    const now = new Date();
    const diff = lastAppointmentDate.getTime() - now.getTime();
    const daysUntilAppointment = Math.ceil(diff / (1000 * 3600 * 24));

    if (daysUntilAppointment <= 7 && daysUntilAppointment >= 0) {
      alerts.push({
        type: 'info' as const,
        message: `Consulta agendada para ${daysUntilAppointment} dias`,
        icon: Clock
      });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alertas do Paciente</CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <p>Nenhum alerta para exibir.</p>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert, index) => (
              <div key={index} className="flex items-center space-x-2">
                <alert.icon className="h-4 w-4 text-yellow-500" />
                <Badge variant="secondary">{alert.message}</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PatientAlerts;
