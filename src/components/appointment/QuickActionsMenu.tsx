
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MoreVertical, CheckCircle, XCircle, Calendar, MessageSquare, Phone, Mail, User, Clock } from 'lucide-react';
import { Appointment, AppointmentStatus } from '@/types/appointment';
import { useToast } from '@/hooks/use-toast';
import { appointmentService } from '@/services/appointmentService';
import { format, parseISO } from 'date-fns';

interface QuickActionsMenuProps {
  appointment: Appointment;
  onUpdate: (appointment: Appointment) => void;
  onDelete: (id: string) => void;
}

const QuickActionsMenu: React.FC<QuickActionsMenuProps> = ({
  appointment,
  onUpdate,
  onDelete
}) => {
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [quickNotes, setQuickNotes] = useState(appointment.notes || '');
  const { toast } = useToast();

  const updateStatus = async (status: AppointmentStatus) => {
    try {
      const result = await appointmentService.updateAppointment(appointment.id, { status });
      
      if (result.success) {
        onUpdate({ ...appointment, status });
        toast({
          title: 'Status Atualizado',
          description: `Agendamento marcado como ${getStatusLabel(status)}`,
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status',
        variant: 'destructive',
      });
    }
  };

  const handleQuickReschedule = async () => {
    if (!newDate || !newTime) return;

    try {
      const newDateTime = `${newDate}T${newTime}:00`;
      const result = await appointmentService.updateAppointment(appointment.id, {
        date: newDate,
        start_time: newDateTime,
        status: 'rescheduled' as AppointmentStatus
      });

      if (result.success) {
        onUpdate({
          ...appointment,
          date: newDate,
          start_time: newDateTime,
          status: 'rescheduled' as AppointmentStatus
        });
        
        toast({
          title: 'Reagendado',
          description: `Agendamento reagendado para ${format(new Date(newDateTime), 'dd/MM/yyyy')} às ${newTime}`,
        });
        
        setIsRescheduleOpen(false);
        setNewDate('');
        setNewTime('');
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível reagendar',
        variant: 'destructive',
      });
    }
  };

  const handleQuickNotes = async () => {
    try {
      const result = await appointmentService.updateAppointment(appointment.id, {
        notes: quickNotes
      });

      if (result.success) {
        onUpdate({ ...appointment, notes: quickNotes });
        toast({
          title: 'Notas Atualizadas',
          description: 'Observações do agendamento foram salvas',
        });
        setIsNotesOpen(false);
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar as notas',
        variant: 'destructive',
      });
    }
  };

  const getStatusLabel = (status: AppointmentStatus): string => {
    const labels = {
      scheduled: 'Agendado',
      completed: 'Concluído',
      cancelled: 'Cancelado',
      no_show: 'Faltou',
      rescheduled: 'Reagendado'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'cancelled': return 'text-red-600';
      case 'no_show': return 'text-gray-600';
      case 'rescheduled': return 'text-blue-600';
      default: return 'text-yellow-600';
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Status Badge */}
      <Badge variant="outline" className={getStatusColor(appointment.status)}>
        {getStatusLabel(appointment.status)}
      </Badge>

      {/* Quick Action Buttons */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => updateStatus('completed')}
          className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
          title="Marcar como Concluído"
        >
          <CheckCircle className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => updateStatus('cancelled')}
          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
          title="Cancelar"
        >
          <XCircle className="h-4 w-4" />
        </Button>

        <Dialog open={isRescheduleOpen} onOpenChange={setIsRescheduleOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              title="Reagendar"
            >
              <Calendar className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Reagendar Rapidamente</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <User className="h-4 w-4 text-gray-600" />
                <span className="font-medium">{appointment.patientName}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="new-date">Nova Data</Label>
                  <Input
                    id="new-date"
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="new-time">Novo Horário</Label>
                  <Input
                    id="new-time"
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsRescheduleOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleQuickReschedule} disabled={!newDate || !newTime}>
                  Reagendar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* More Actions Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => updateStatus('no_show')}>
            <Clock className="h-4 w-4 mr-2" />
            Marcar como Faltou
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <Dialog open={isNotesOpen} onOpenChange={setIsNotesOpen}>
            <DialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Editar Notas
              </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Notas Rápidas</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <User className="h-4 w-4 text-gray-600" />
                  <span className="font-medium">{appointment.patientName}</span>
                </div>
                
                <div>
                  <Label htmlFor="quick-notes">Observações</Label>
                  <textarea
                    id="quick-notes"
                    className="w-full min-h-[100px] p-3 border rounded-lg resize-none"
                    value={quickNotes}
                    onChange={(e) => setQuickNotes(e.target.value)}
                    placeholder="Adicione observações sobre este agendamento..."
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsNotesOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleQuickNotes}>
                    Salvar Notas
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <DropdownMenuItem>
            <Phone className="h-4 w-4 mr-2" />
            Ligar para Paciente
          </DropdownMenuItem>
          
          <DropdownMenuItem>
            <Mail className="h-4 w-4 mr-2" />
            Enviar Email
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={() => onDelete(appointment.id)}
            className="text-red-600 focus:text-red-600"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Excluir Agendamento
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default QuickActionsMenu;
