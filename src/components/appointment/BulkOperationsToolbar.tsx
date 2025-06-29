
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, Trash2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { AppointmentStatus } from '@/types/appointment';
import { useBulkAppointmentOperations } from '@/hooks/appointments/useBulkAppointmentOperations';
import { Appointment } from '@/types/appointment';

interface BulkOperationsToolbarProps {
  selectedAppointments: string[];
  appointments: Appointment[];
  onClearSelection: () => void;
  onRefresh: () => Promise<void>;
}

const BulkOperationsToolbar: React.FC<BulkOperationsToolbarProps> = ({
  selectedAppointments,
  appointments,
  onClearSelection,
  onRefresh
}) => {
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<AppointmentStatus>('scheduled');

  const {
    isProcessing,
    bulkUpdateStatus,
    bulkReschedule,
    bulkDelete
  } = useBulkAppointmentOperations(onRefresh);

  if (selectedAppointments.length === 0) return null;

  const handleBulkReschedule = async () => {
    if (!newDate) return;
    await bulkReschedule(newDate, newTime);
    setNewDate('');
    setNewTime('');
  };

  const handleBulkStatusUpdate = async () => {
    await bulkUpdateStatus(selectedStatus);
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Tem certeza que deseja excluir ${selectedAppointments.length} agendamento${selectedAppointments.length > 1 ? 's' : ''}?`)) {
      await bulkDelete();
    }
  };

  return (
    <Card className="mb-6 border-blue-200 bg-blue-50/50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-blue-900">
              {selectedAppointments.length} agendamento{selectedAppointments.length > 1 ? 's' : ''} selecionado{selectedAppointments.length > 1 ? 's' : ''}
            </span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onClearSelection}
            disabled={isProcessing}
          >
            Cancelar Seleção
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Bulk Reschedule */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Reagendar</Label>
            <div className="flex gap-2">
              <Input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="flex-1"
                disabled={isProcessing}
              />
              <Input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-24"
                disabled={isProcessing}
              />
            </div>
            <Button
              size="sm"
              onClick={handleBulkReschedule}
              disabled={!newDate || isProcessing}
              className="w-full"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Reagendar
            </Button>
          </div>

          {/* Bulk Status Update */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Alterar Status</Label>
            <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as AppointmentStatus)}>
              <SelectTrigger disabled={isProcessing}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Agendado</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
                <SelectItem value="no_show">Faltou</SelectItem>
                <SelectItem value="rescheduled">Reagendado</SelectItem>
              </SelectContent>
            </Select>
            <Button
              size="sm"
              onClick={handleBulkStatusUpdate}
              disabled={isProcessing}
              className="w-full"
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              Atualizar Status
            </Button>
          </div>

          {/* Bulk Delete */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Ações Perigosas</Label>
            <div className="h-10"></div> {/* Spacer to align with other sections */}
            <Button
              size="sm"
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={isProcessing}
              className="w-full"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir Todos
            </Button>
          </div>
        </div>

        {isProcessing && (
          <div className="mt-4 flex items-center justify-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              Processando operações...
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BulkOperationsToolbar;
