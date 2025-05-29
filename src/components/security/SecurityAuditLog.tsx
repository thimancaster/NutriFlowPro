
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Shield, AlertTriangle, Eye, RefreshCw } from 'lucide-react';
import { useSecurityAudit } from '@/hooks/useSecurityAudit';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const SecurityAuditLog: React.FC = () => {
  const { events, isLoading, isAdmin, fetchSecurityEvents } = useSecurityAudit();

  useEffect(() => {
    if (isAdmin) {
      fetchSecurityEvents();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center text-muted-foreground">
            <Shield className="h-8 w-8 mr-2" />
            <span>Acesso restrito a administradores</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getEventIcon = (eventType: string) => {
    if (eventType.includes('failed') || eventType.includes('rate_limited')) {
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
    return <Eye className="h-4 w-4 text-blue-500" />;
  };

  const getEventBadgeVariant = (eventType: string): "default" | "destructive" | "secondary" => {
    if (eventType.includes('failed') || eventType.includes('rate_limited')) {
      return "destructive";
    }
    if (eventType.includes('success')) {
      return "default";
    }
    return "secondary";
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Log de Auditoria de Segurança
          </CardTitle>
          <Button
            onClick={() => fetchSecurityEvents()}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          {events.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Nenhum evento de segurança registrado
            </div>
          ) : (
            <div className="space-y-2">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50"
                >
                  {getEventIcon(event.event_type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge variant={getEventBadgeVariant(event.event_type)}>
                        {event.event_type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(event.created_at), 'dd/MM/yyyy HH:mm:ss', {
                          locale: ptBR
                        })}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {event.event_data?.email && (
                        <span>Email: {event.event_data.email}</span>
                      )}
                      {event.event_data?.error && (
                        <div className="text-red-600 text-xs mt-1">
                          Erro: {event.event_data.error}
                        </div>
                      )}
                      {event.ip_address && (
                        <div className="text-xs mt-1">
                          IP: {event.ip_address}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default SecurityAuditLog;
