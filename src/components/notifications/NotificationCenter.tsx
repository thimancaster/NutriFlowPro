
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Calendar, Target, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Notification {
  id: string;
  type: 'appointment' | 'goal' | 'alert' | 'reminder';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  read: boolean;
  created_at: string;
  patient_id?: string;
  patient_name?: string;
}

const NotificationCenter: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'unread' | 'high'>('unread');

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications', filter],
    queryFn: async (): Promise<Notification[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Simulate notifications - in a real app, these would come from the database
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'appointment',
          title: 'Consulta Próxima',
          message: 'Consulta com Maria Silva em 1 hora',
          priority: 'high',
          read: false,
          created_at: new Date().toISOString(),
          patient_id: 'patient-1',
          patient_name: 'Maria Silva'
        },
        {
          id: '2',
          type: 'goal',
          title: 'Meta Atingida',
          message: 'João Santos atingiu sua meta de peso!',
          priority: 'medium',
          read: false,
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          patient_id: 'patient-2',
          patient_name: 'João Santos'
        },
        {
          id: '3',
          type: 'alert',
          title: 'Atenção Necessária',
          message: 'Ana Costa não compareceu à última consulta',
          priority: 'medium',
          read: true,
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          patient_id: 'patient-3',
          patient_name: 'Ana Costa'
        },
        {
          id: '4',
          type: 'reminder',
          title: 'Lembrete',
          message: 'Atualizar plano alimentar de Pedro Lima',
          priority: 'low',
          read: false,
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          patient_id: 'patient-4',
          patient_name: 'Pedro Lima'
        }
      ];

      // Filter notifications based on current filter
      return mockNotifications.filter(notification => {
        if (filter === 'unread') return !notification.read;
        if (filter === 'high') return notification.priority === 'high';
        return true;
      });
    }
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return notificationId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast({
        title: 'Notificação marcada como lida',
        description: 'A notificação foi atualizada com sucesso.'
      });
    }
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return notificationId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast({
        title: 'Notificação removida',
        description: 'A notificação foi removida com sucesso.'
      });
    }
  });

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'appointment': return <Calendar className="h-4 w-4" />;
      case 'goal': return <Target className="h-4 w-4" />;
      case 'alert': return <AlertTriangle className="h-4 w-4" />;
      case 'reminder': return <Bell className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Central de Notificações
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              Todas
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('unread')}
            >
              Não lidas
            </Button>
            <Button
              variant={filter === 'high' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('high')}
            >
              Urgentes
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : notifications?.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Nenhuma notificação encontrada</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications?.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border rounded-lg transition-colors ${
                  notification.read ? 'bg-gray-50' : 'bg-white border-blue-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-full ${
                      notification.priority === 'high' ? 'bg-red-100 text-red-600' :
                      notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-medium ${!notification.read ? 'font-semibold' : ''}`}>
                          {notification.title}
                        </h4>
                        <Badge variant={getPriorityColor(notification.priority)} className="text-xs">
                          {notification.priority === 'high' ? 'Alta' : 
                           notification.priority === 'medium' ? 'Média' : 'Baixa'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>
                          {format(new Date(notification.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </span>
                        {notification.patient_name && (
                          <span>Paciente: {notification.patient_name}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsReadMutation.mutate(notification.id)}
                        disabled={markAsReadMutation.isPending}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteNotificationMutation.mutate(notification.id)}
                      disabled={deleteNotificationMutation.isPending}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationCenter;
