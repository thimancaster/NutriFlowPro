
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, CheckCircle, Clock, TrendingDown, TrendingUp, Bell, BellOff } from 'lucide-react';
import { Patient } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { calculationHistoryService } from '@/services/calculationHistoryService';

interface Alert {
  id: string;
  type: 'goal_deadline' | 'weight_change' | 'no_progress' | 'appointment_due' | 'measurement_needed';
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'error';
  created_at: string;
  dismissed: boolean;
  action_needed?: string;
}

interface PatientAlertsProps {
  patient: Patient;
}

const PatientAlerts: React.FC<PatientAlertsProps> = ({ patient }) => {
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showDismissed, setShowDismissed] = useState(false);

  // Fetch calculation history for analysis
  const { data: calculations } = useQuery({
    queryKey: ['patient-calculation-history', patient.id],
    const calculations = await calculationService.getPatientCalculations(patientId);
    enabled: !!patient.id
  });

  useEffect(() => {
    generateAlerts();
  }, [patient, calculations]);

  const generateAlerts = () => {
    const newAlerts: Alert[] = [];

    // Check for goal deadlines
    if (patient.goals && typeof patient.goals === 'object') {
      const goals = (patient.goals as any).customGoals || [];
      goals.forEach((goal: any) => {
        if (goal.target_date && goal.status === 'active') {
          const targetDate = new Date(goal.target_date);
          const today = new Date();
          const daysUntilDeadline = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysUntilDeadline <= 7 && daysUntilDeadline > 0) {
            newAlerts.push({
              id: `goal_deadline_${goal.id}`,
              type: 'goal_deadline',
              title: 'Meta próxima do prazo',
              description: `A meta "${goal.name}" vence em ${daysUntilDeadline} dias`,
              severity: daysUntilDeadline <= 3 ? 'error' : 'warning',
              created_at: new Date().toISOString(),
              dismissed: false,
              action_needed: 'Verificar progresso da meta'
            });
          } else if (daysUntilDeadline < 0) {
            newAlerts.push({
              id: `goal_overdue_${goal.id}`,
              type: 'goal_deadline',
              title: 'Meta em atraso',
              description: `A meta "${goal.name}" venceu há ${Math.abs(daysUntilDeadline)} dias`,
              severity: 'error',
              created_at: new Date().toISOString(),
              dismissed: false,
              action_needed: 'Revisar meta ou definir nova data'
            });
          }
        }
      });
    }

    // Check for appointment scheduling
    const lastAppointment = patient.last_appointment ? new Date(patient.last_appointment) : null;
    if (lastAppointment) {
      const daysSinceLastAppointment = Math.floor((new Date().getTime() - lastAppointment.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceLastAppointment > 30) {
        newAlerts.push({
          id: 'appointment_due',
          type: 'appointment_due',
          title: 'Consulta em atraso',
          description: `Última consulta foi há ${daysSinceLastAppointment} dias`,
          severity: daysSinceLastAppointment > 60 ? 'error' : 'warning',
          created_at: new Date().toISOString(),
          dismissed: false,
          action_needed: 'Agendar nova consulta'
        });
      }
    }

    // Check weight changes if calculations exist
    if (calculations && calculations.length >= 2) {
      const recent = calculations.slice(0, 2);
      const [latest, previous] = recent;
      
      const weightChange = latest.weight - previous.weight;
      const percentChange = (weightChange / previous.weight) * 100;
      
      if (Math.abs(percentChange) > 5) {
        newAlerts.push({
          id: 'significant_weight_change',
          type: 'weight_change',
          title: 'Mudança significativa de peso',
          description: `${weightChange > 0 ? 'Ganho' : 'Perda'} de ${Math.abs(weightChange).toFixed(1)}kg (${Math.abs(percentChange).toFixed(1)}%)`,
          severity: Math.abs(percentChange) > 10 ? 'error' : 'warning',
          created_at: new Date().toISOString(),
          dismissed: false,
          action_needed: 'Avaliar causas e ajustar plano'
        });
      }
    }

    // Check for lack of progress
    if (calculations && calculations.length >= 3) {
      const recentThree = calculations.slice(0, 3);
      const weights = recentThree.map(c => c.weight);
      const isStagnant = Math.max(...weights) - Math.min(...weights) < 0.5;
      
      if (isStagnant) {
        newAlerts.push({
          id: 'no_progress',
          type: 'no_progress',
          title: 'Peso estagnado',
          description: 'Peso mantido nas últimas 3 avaliações',
          severity: 'info',
          created_at: new Date().toISOString(),
          dismissed: false,
          action_needed: 'Considerar ajustes no plano'
        });
      }
    }

    setAlerts(newAlerts);
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId ? { ...alert, dismissed: true } : alert
    ));
    
    toast({
      title: 'Alerta dispensado',
      description: 'O alerta foi marcado como lido'
    });
  };

  const getSeverityIcon = (severity: Alert['severity']) => {
    switch (severity) {
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'warning': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'info': return <CheckCircle className="h-4 w-4 text-blue-600" />;
    }
  };

  const getSeverityColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'error': return 'border-red-200 bg-red-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'info': return 'border-blue-200 bg-blue-50';
    }
  };

  const activeAlerts = alerts.filter(alert => !alert.dismissed);
  const dismissedAlerts = alerts.filter(alert => alert.dismissed);

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Alertas do Paciente
            {activeAlerts.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {activeAlerts.length}
              </Badge>
            )}
          </CardTitle>
          
          {dismissedAlerts.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDismissed(!showDismissed)}
              className="flex items-center gap-1"
            >
              {showDismissed ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
              {showDismissed ? 'Ocultar dispensados' : 'Ver dispensados'}
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {activeAlerts.length === 0 && dismissedAlerts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500 opacity-50" />
            <p>Nenhum alerta ativo</p>
            <p className="text-sm">Tudo está em ordem com este paciente</p>
          </div>
        ) : (
          <>
            {/* Active Alerts */}
            {activeAlerts.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Alertas Ativos</h4>
                {activeAlerts.map((alert) => (
                  <Card key={alert.id} className={`p-4 ${getSeverityColor(alert.severity)}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex gap-3 flex-1">
                        {getSeverityIcon(alert.severity)}
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{alert.title}</h5>
                          <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                          {alert.action_needed && (
                            <p className="text-sm font-medium text-gray-800 mt-2">
                              <strong>Ação:</strong> {alert.action_needed}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(alert.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => dismissAlert(alert.id)}
                        className="shrink-0"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
            
            {/* Dismissed Alerts */}
            {showDismissed && dismissedAlerts.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-500">Alertas Dispensados</h4>
                {dismissedAlerts.map((alert) => (
                  <Card key={alert.id} className="p-4 bg-gray-50 opacity-60">
                    <div className="flex gap-3">
                      <CheckCircle className="h-4 w-4 text-gray-400" />
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-600">{alert.title}</h5>
                        <p className="text-sm text-gray-500">{alert.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PatientAlerts;
