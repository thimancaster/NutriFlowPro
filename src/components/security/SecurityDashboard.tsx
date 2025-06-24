
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSecurityAudit } from '@/hooks/useSecurityAudit';
import { useSecurityContext } from './SecurityProvider';
import { AlertTriangle, Shield, Users, Activity } from 'lucide-react';

export const SecurityDashboard: React.FC = () => {
  const { events, isLoading, isAdmin, fetchSecurityEvents } = useSecurityAudit();
  const { isSecure, sessionValid, suspiciousActivity } = useSecurityContext();

  React.useEffect(() => {
    if (isAdmin) {
      fetchSecurityEvents(50);
    }
  }, [isAdmin, fetchSecurityEvents]);

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            Acesso negado. Apenas administradores podem ver este dashboard.
          </p>
        </CardContent>
      </Card>
    );
  }

  const securityStats = {
    totalEvents: events.length,
    failedLogins: events.filter(e => e.event_type === 'login_failed').length,
    rateLimitExceeded: events.filter(e => e.event_type === 'rate_limit_exceeded').length,
    suspiciousActivities: events.filter(e => e.event_type === 'suspicious_activity_detected').length
  };

  return (
    <div className="space-y-6">
      {/* Security Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status de Segurança</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge variant={isSecure ? 'default' : 'destructive'}>
              {isSecure ? 'Seguro' : 'Atenção'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos Totais</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityStats.totalEvents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tentativas de Login Falhadas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {securityStats.failedLogins}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rate Limits Excedidos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {securityStats.rateLimitExceeded}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Security Events */}
      <Card>
        <CardHeader>
          <CardTitle>Eventos de Segurança Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Carregando eventos...</p>
          ) : events.length > 0 ? (
            <div className="space-y-2">
              {events.slice(0, 10).map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-2 border rounded"
                >
                  <div>
                    <div className="font-medium">{event.event_type}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(event.created_at).toLocaleString('pt-BR')}
                    </div>
                  </div>
                  <Badge
                    variant={
                      event.event_type.includes('failed') || 
                      event.event_type.includes('suspicious') ||
                      event.event_type.includes('rate_limit')
                        ? 'destructive'
                        : 'default'
                    }
                  >
                    {event.event_type.includes('failed') ? 'Falha' :
                     event.event_type.includes('suspicious') ? 'Suspeito' :
                     event.event_type.includes('rate_limit') ? 'Rate Limit' : 'Normal'}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p>Nenhum evento de segurança encontrado.</p>
          )}
        </CardContent>
      </Card>

      {/* Security Warnings */}
      {(!sessionValid || suspiciousActivity) && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-700">Alertas de Segurança</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {!sessionValid && (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Sessão inválida detectada</span>
                </div>
              )}
              {suspiciousActivity && (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Atividade suspeita detectada</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
