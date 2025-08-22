import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, Warning, CheckCircle, AlertCircle } from 'lucide-react';
import { Patient } from '@/types';

interface PatientAlertsTabProps {
  patient: Patient;
}

const PatientAlerts: React.FC<PatientAlertsTabProps> = ({ patient }) => {
  const checkAppointmentAlerts = () => {
    const alerts = [];
    
    // Check for overdue appointments - handle optional last_appointment
    if (patient.last_appointment) {
      const lastAppointment = new Date(patient.last_appointment);
      const daysSinceLastAppointment = Math.floor(
        (new Date().getTime() - lastAppointment.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysSinceLastAppointment > 90) {
        alerts.push({
          id: 'overdue-appointment',
          type: 'error' as const,
          title: 'Consulta em Atraso',
          message: `Última consulta há ${daysSinceLastAppointment} dias. Reagende o paciente.`,
          action: 'Agendar Consulta'
        });
      } else if (daysSinceLastAppointment > 60) {
        alerts.push({
          id: 'appointment-due',
          type: 'warning' as const,
          title: 'Consulta Próxima do Vencimento',
          message: `Última consulta há ${daysSinceLastAppointment} dias. Considere reagendar.`,
          action: 'Agendar Consulta'
        });
      }
    } else {
      // No appointment history
      alerts.push({
        id: 'no-appointments',
        type: 'info' as const,
        title: 'Sem Histórico de Consultas',
        message: 'Este paciente ainda não tem consultas registradas.',
        action: 'Agendar Primeira Consulta'
      });
    }
    
    return alerts;
  };

  const alerts = checkAppointmentAlerts();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alertas do Paciente</CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length > 0 ? (
          alerts.map((alert) => (
            <Alert key={alert.id} variant={alert.type}>
              {alert.type === 'info' && <Info className="h-4 w-4" />}
              {alert.type === 'warning' && <Warning className="h-4 w-4" />}
              {alert.type === 'success' && <CheckCircle className="h-4 w-4" />}
              {alert.type === 'error' && <AlertCircle className="h-4 w-4" />}
              <AlertTitle>{alert.title}</AlertTitle>
              <AlertDescription>
                {alert.message}
                {alert.action && (
                  <button className="underline ml-1">{alert.action}</button>
                )}
              </AlertDescription>
            </Alert>
          ))
        ) : (
          <Alert variant="default">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Nenhum Alerta</AlertTitle>
            <AlertDescription>Nenhum alerta pendente para este paciente.</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default PatientAlerts;
