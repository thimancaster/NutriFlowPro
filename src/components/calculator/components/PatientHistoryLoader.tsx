
import React, { useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, TrendingUp, User } from 'lucide-react';
import { usePatientConsultationHistory } from '@/hooks/usePatientConsultationHistory';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PatientHistoryLoaderProps {
  patientId?: string;
  onDataLoaded?: (data: {
    weight: string;
    height: string;
    age: string;
    gender: 'male' | 'female';
    activityLevel: string;
    objective: string;
    consultationType: 'primeira_consulta' | 'retorno';
  }) => void;
}

const PatientHistoryLoader: React.FC<PatientHistoryLoaderProps> = ({
  patientId,
  onDataLoaded
}) => {
  const { lastConsultation, consultationType, isLoading, history } = usePatientConsultationHistory(patientId);

  useEffect(() => {
    if (lastConsultation && onDataLoaded) {
      // Mapear dados da última consulta para o formato esperado
      const loadedData = {
        weight: lastConsultation.weight.toString(),
        height: lastConsultation.height.toString(),
        age: lastConsultation.age.toString(),
        gender: lastConsultation.sex === 'M' ? 'male' as const : 'female' as const,
        activityLevel: lastConsultation.activity_level,
        objective: lastConsultation.objective,
        consultationType: consultationType
      };

      console.log('Carregando dados da última consulta:', loadedData);
      onDataLoaded(loadedData);
    }
  }, [lastConsultation, consultationType, onDataLoaded]);

  if (!patientId) {
    return null;
  }

  if (isLoading) {
    return (
      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span className="text-sm text-muted-foreground">Carregando histórico do paciente...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Histórico do Paciente
          <Badge variant={consultationType === 'primeira_consulta' ? 'default' : 'secondary'}>
            {consultationType === 'primeira_consulta' ? 'Primeira Consulta' : `${history.length + 1}ª Consulta`}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {lastConsultation ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Última consulta: {format(new Date(lastConsultation.calculation_date), 'dd/MM/yyyy', { locale: ptBR })}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Peso:</span>
                <div className="font-medium">{lastConsultation.weight} kg</div>
              </div>
              <div>
                <span className="text-muted-foreground">Altura:</span>
                <div className="font-medium">{lastConsultation.height} cm</div>
              </div>
              <div>
                <span className="text-muted-foreground">TMB:</span>
                <div className="font-medium">{Math.round(lastConsultation.tmb)} kcal</div>
              </div>
              <div>
                <span className="text-muted-foreground">GET:</span>
                <div className="font-medium">{Math.round(lastConsultation.get)} kcal</div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 p-2 rounded">
              <TrendingUp className="h-3 w-3" />
              Os dados da última consulta foram carregados automaticamente e podem ser editados conforme necessário.
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            Este é o primeiro atendimento do paciente. Todos os campos estão em branco para preenchimento.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PatientHistoryLoader;
