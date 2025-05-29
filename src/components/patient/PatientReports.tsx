
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Download, FileText, Calendar, Settings, Loader2 } from 'lucide-react';
import { Patient } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { calculationHistoryService } from '@/services/calculationHistoryService';
import { generatePatientReportPDF } from '@/utils/pdf/patientReportGenerator';

interface ReportOptions {
  type: 'complete' | 'evolution' | 'goals' | 'custom';
  period: 'last_month' | 'last_3_months' | 'last_6_months' | 'all_time' | 'custom';
  includeCharts: boolean;
  includeGoals: boolean;
  includeAlerts: boolean;
  includeRecommendations: boolean;
  includeNotes: boolean;
}

interface PatientReportsProps {
  patient: Patient;
}

const PatientReports: React.FC<PatientReportsProps> = ({ patient }) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportOptions, setReportOptions] = useState<ReportOptions>({
    type: 'complete',
    period: 'last_3_months',
    includeCharts: true,
    includeGoals: true,
    includeAlerts: false,
    includeRecommendations: true,
    includeNotes: true
  });

  // Fetch calculation history for reports
  const { data: calculations, isLoading } = useQuery({
    queryKey: ['patient-calculation-history', patient.id, reportOptions.period],
    queryFn: () => {
      const period = reportOptions.period === 'all_time' ? 'all' : 
                    reportOptions.period === 'last_month' ? 'month' :
                    reportOptions.period === 'last_3_months' ? '3months' :
                    reportOptions.period === 'last_6_months' ? '6months' : 'all';
      return calculationHistoryService.getPatientHistory(patient.id, period);
    },
    enabled: !!patient.id
  });

  const handleGenerateReport = async () => {
    if (!calculations || calculations.length === 0) {
      toast({
        title: 'Sem dados',
        description: 'Não há dados suficientes para gerar o relatório.',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);

    try {
      const pdf = await generatePatientReportPDF({
        patient,
        calculations,
        options: reportOptions
      });

      // Generate filename
      const date = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
      const filename = `relatorio-${patient.name.replace(/\s+/g, '-').toLowerCase()}-${date}.pdf`;

      // Download PDF
      pdf.save(filename);

      toast({
        title: 'Relatório gerado',
        description: 'O relatório foi gerado e baixado com sucesso.'
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: 'Erro ao gerar relatório',
        description: 'Não foi possível gerar o relatório. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getReportTypeDescription = (type: ReportOptions['type']) => {
    switch (type) {
      case 'complete': return 'Relatório completo com todos os dados do paciente';
      case 'evolution': return 'Foco na evolução das medidas e progresso';
      case 'goals': return 'Relatório focado nas metas e objetivos';
      case 'custom': return 'Relatório personalizado com opções selecionadas';
    }
  };

  const getPeriodDescription = (period: ReportOptions['period']) => {
    switch (period) {
      case 'last_month': return 'Último mês';
      case 'last_3_months': return 'Últimos 3 meses';
      case 'last_6_months': return 'Últimos 6 meses';
      case 'all_time': return 'Todo o período';
      case 'custom': return 'Período personalizado';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Relatórios do Paciente
          {calculations && (
            <Badge variant="outline" className="ml-2">
              {calculations.length} avaliações
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Report Type Selection */}
        <div>
          <h4 className="font-medium mb-3">Tipo de Relatório</h4>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'complete', label: 'Completo', icon: FileText },
              { value: 'evolution', label: 'Evolução', icon: Calendar },
              { value: 'goals', label: 'Metas', icon: Download },
              { value: 'custom', label: 'Personalizado', icon: Settings }
            ].map((type) => (
              <Button
                key={type.value}
                variant={reportOptions.type === type.value ? 'default' : 'outline'}
                onClick={() => setReportOptions({ ...reportOptions, type: type.value as ReportOptions['type'] })}
                className="justify-start h-auto p-3"
              >
                <type.icon className="h-4 w-4 mr-2" />
                <div className="text-left">
                  <div className="font-medium">{type.label}</div>
                  <div className="text-xs text-gray-500">
                    {getReportTypeDescription(type.value as ReportOptions['type'])}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Period Selection */}
        <div>
          <h4 className="font-medium mb-3">Período</h4>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'last_month', label: 'Último mês' },
              { value: 'last_3_months', label: 'Últimos 3 meses' },
              { value: 'last_6_months', label: 'Últimos 6 meses' },
              { value: 'all_time', label: 'Todo o período' }
            ].map((period) => (
              <Button
                key={period.value}
                variant={reportOptions.period === period.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setReportOptions({ ...reportOptions, period: period.value as ReportOptions['period'] })}
              >
                {period.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Custom Options */}
        {reportOptions.type === 'custom' && (
          <div>
            <h4 className="font-medium mb-3">Opções de Inclusão</h4>
            <div className="space-y-2">
              {[
                { key: 'includeCharts', label: 'Gráficos e visualizações' },
                { key: 'includeGoals', label: 'Metas e objetivos' },
                { key: 'includeAlerts', label: 'Alertas e notificações' },
                { key: 'includeRecommendations', label: 'Recomendações' },
                { key: 'includeNotes', label: 'Anotações e observações' }
              ].map((option) => (
                <label key={option.key} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={reportOptions[option.key as keyof ReportOptions] as boolean}
                    onChange={(e) => setReportOptions({
                      ...reportOptions,
                      [option.key]: e.target.checked
                    })}
                    className="rounded"
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Preview Info */}
        <Card className="p-4 bg-gray-50">
          <h4 className="font-medium mb-2">Prévia do Relatório</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Tipo:</strong> {getReportTypeDescription(reportOptions.type)}</p>
            <p><strong>Período:</strong> {getPeriodDescription(reportOptions.period)}</p>
            <p><strong>Avaliações incluídas:</strong> {calculations?.length || 0}</p>
          </div>
        </Card>

        {/* Generate Button */}
        <div className="flex gap-3">
          <Button
            onClick={handleGenerateReport}
            disabled={isGenerating || isLoading || !calculations?.length}
            className="flex-1"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {isGenerating ? 'Gerando...' : 'Gerar Relatório PDF'}
          </Button>
        </div>

        {/* Quick Actions */}
        <div>
          <h4 className="font-medium mb-3">Ações Rápidas</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setReportOptions({
                  type: 'evolution',
                  period: 'last_3_months',
                  includeCharts: true,
                  includeGoals: false,
                  includeAlerts: false,
                  includeRecommendations: true,
                  includeNotes: false
                });
                setTimeout(handleGenerateReport, 100);
              }}
            >
              Relatório de Evolução
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setReportOptions({
                  type: 'goals',
                  period: 'all_time',
                  includeCharts: false,
                  includeGoals: true,
                  includeAlerts: true,
                  includeRecommendations: true,
                  includeNotes: true
                });
                setTimeout(handleGenerateReport, 100);
              }}
            >
              Relatório de Metas
            </Button>
          </div>
        </div>

        {isLoading && (
          <div className="text-center py-4">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-500">Carregando dados...</p>
          </div>
        )}

        {!isLoading && (!calculations || calculations.length === 0) && (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>Nenhuma avaliação encontrada</p>
            <p className="text-sm">Adicione avaliações para gerar relatórios</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PatientReports;
