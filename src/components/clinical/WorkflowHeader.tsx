
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, Save, FileText } from 'lucide-react';
import { ConsultationData } from '@/types';
import { Patient } from '@/types/patient';

interface WorkflowHeaderProps {
  activePatient: Patient | null;
  activeConsultation: ConsultationData | null;
  isSaving: boolean;
  lastSaved: Date | null;
  onSave: () => void;
  onComplete: () => void;
}

const WorkflowHeader: React.FC<WorkflowHeaderProps> = ({
  activePatient,
  activeConsultation,
  isSaving,
  lastSaved,
  onSave,
  onComplete
}) => {
  const formatDate = (date: string | Date | undefined) => {
    if (!date) return 'Data não definida';
    
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toLocaleDateString('pt-BR');
    } catch (error) {
      return 'Data inválida';
    }
  };

  const formatDateTime = (date: string | Date | undefined) => {
    if (!date) return 'Não salvo';
    
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toLocaleString('pt-BR');
    } catch (error) {
      return 'Data inválida';
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Fluxo Clínico
          </CardTitle>
          <div className="flex gap-2">
            <Button
              onClick={onSave}
              disabled={isSaving}
              variant="outline"
              size="sm"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
            <Button
              onClick={onComplete}
              disabled={!activeConsultation}
              size="sm"
            >
              <FileText className="h-4 w-4 mr-2" />
              Finalizar Consulta
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Patient Info */}
          <div className="space-y-2">
            <h3 className="font-medium text-sm text-gray-600">Paciente</h3>
            {activePatient ? (
              <div>
                <p className="font-medium">{activePatient.name}</p>
                <p className="text-sm text-gray-500">
                  {activePatient.age} anos • {activePatient.gender === 'male' ? 'Masculino' : 'Feminino'}
                </p>
              </div>
            ) : (
              <p className="text-gray-400">Nenhum paciente selecionado</p>
            )}
          </div>

          {/* Consultation Date */}
          <div className="space-y-2">
            <h3 className="font-medium text-sm text-gray-600 flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Data da Consulta
            </h3>
            <p className="text-sm">
              {formatDate(activeConsultation?.created_at)}
            </p>
            <Badge variant="outline" className="text-xs">
              {activeConsultation?.id ? 'Em andamento' : 'Nova consulta'}
            </Badge>
          </div>

          {/* Last Save */}
          <div className="space-y-2">
            <h3 className="font-medium text-sm text-gray-600 flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Último Salvamento
            </h3>
            <p className="text-sm">
              {formatDateTime(lastSaved?.toISOString())}
            </p>
            {isSaving && (
              <Badge variant="secondary" className="text-xs">
                Salvando...
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkflowHeader;
