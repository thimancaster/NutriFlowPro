
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { FileText, Download, Loader2, Calendar, TrendingUp, Target } from 'lucide-react';
import { Patient } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { calculationHistoryService } from '@/services/calculationHistoryService';
import { generatePatientReportPDF } from '@/utils/pdf/patientReportGenerator';

interface ReportOptions {
  type: 'complete' | 'evolution' | 'goals' | 'custom';
  period: 'last_month' | 'last_3_months' | 'last_6_months' | 'all_time' | 'custom';
  startDate?: string;
  endDate?: string;
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
    includeAlerts: true,
    includeRecommendations: true,
    includeNotes: true
  });

  // Fetch calculation history
  const { data: calculations } = useQuery({
    queryKey: ['patient-calculation-history', patient.id],
    queryFn: () => calculationHistoryService.getPatientCalculations(patient.id),
    enabled: !!patient.id
  });

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    
    try {
      // Filter calculations based on period
      let filteredCalculations = calculations || [];
      
      if (reportOptions.period !== 'all_time') {
        const today = new Date();
        let startDate: Date;
        
        switch (reportOptions.period) {
          case 'last_month':
            startDate = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
            break;
          case 'last_3_months':
            startDate = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
            break;
          case 'last_6_months':
            startDate = new Date(today.getFullYear(), today.getMonth() - 6, today.getDate());
            break;
          case 'custom':
            if (reportOptions.startDate && reportOptions.endDate) {
              startDate = new Date(reportOptions.startDate);
              const endDate = new Date(reportOptions.endDate);
              filteredCalculations = filteredCalculations.filter(calc => {
                const calcDate = new Date(calc.calculation_date);
                return calcDate >= startDate && calcDate <= endDate;
              });
            }
            break;
          default:
            startDate = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
        }
        
        if (reportOptions.period !== 'custom') {
          filteredCalculations = filteredCalculations.filter(calc => {
            const calcDate = new Date(calc.calculation_date);
            return calcDate >= startDate;
          });
        }
      }

      // Generate PDF
      const doc = await generatePatientReportPDF({
        patient,
        calculations: filteredCalculations,
        options: reportOptions
      });

      // Download the PDF
      doc.save(`Relatorio_${patient.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: 'Relatório gerado',
        description: 'O relatório foi gerado e baixado com sucesso'
      });
      
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível gerar o relatório',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const updateReportOption = <K extends keyof ReportOptions>(
    key: K,
    value: ReportOptions[K]
  ) => {
    setReportOptions(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Relatórios do Paciente
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Report Type */}
        <div>
          <Label htmlFor="reportType">Tipo de Relatório</Label>
          <Select
            value={reportOptions.type}
            onValueChange={(value: ReportOptions['type']) => updateReportOption('type', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="complete">Relatório Completo</SelectItem>
              <SelectItem value="evolution">Evolução Nutricional</SelectItem>
              <SelectItem value="goals">Análise de Metas</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Period Selection */}
        <div>
          <Label htmlFor="period">Período</Label>
          <Select
            value={reportOptions.period}
            onValueChange={(value: ReportOptions['period']) => updateReportOption('period', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last_month">Último Mês</SelectItem>
              <SelectItem value="last_3_months">Últimos 3 Meses</SelectItem>
              <SelectItem value="last_6_months">Últimos 6 Meses</SelectItem>
              <SelectItem value="all_time">Todo o Período</SelectItem>
              <SelectItem value="custom">Período Personalizado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Custom Date Range */}
        {reportOptions.period === 'custom' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Data Início</Label>
              <Input
                id="startDate"
                type="date"
                value={reportOptions.startDate || ''}
                onChange={(e) => updateReportOption('startDate', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endDate">Data Fim</Label>
              <Input
                id="endDate"
                type="date"
                value={reportOptions.endDate || ''}
                onChange={(e) => updateReportOption('endDate', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Report Options */}
        <div className="space-y-3">
          <Label>Incluir no Relatório</Label>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeCharts"
              checked={reportOptions.includeCharts}
              onCheckedChange={(checked) => updateReportOption('includeCharts', checked as boolean)}
            />
            <Label htmlFor="includeCharts" className="text-sm">
              Gráficos de evolução
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeGoals"
              checked={reportOptions.includeGoals}
              onCheckedChange={(checked) => updateReportOption('includeGoals', checked as boolean)}
            />
            <Label htmlFor="includeGoals" className="text-sm">
              Metas e objetivos
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeAlerts"
              checked={reportOptions.includeAlerts}
              onCheckedChange={(checked) => updateReportOption('includeAlerts', checked as boolean)}
            />
            <Label htmlFor="includeAlerts" className="text-sm">
              Alertas e recomendações
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeRecommendations"
              checked={reportOptions.includeRecommendations}
              onCheckedChange={(checked) => updateReportOption('includeRecommendations', checked as boolean)}
            />
            <Label htmlFor="includeRecommendations" className="text-sm">
              Recomendações nutricionais
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeNotes"
              checked={reportOptions.includeNotes}
              onCheckedChange={(checked) => updateReportOption('includeNotes', checked as boolean)}
            />
            <Label htmlFor="includeNotes" className="text-sm">
              Anotações do paciente
            </Label>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-xs text-gray-500">Avaliações</p>
                <p className="font-semibold">{calculations?.length || 0}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-xs text-gray-500">Última Evolução</p>
                <p className="font-semibold">
                  {calculations && calculations.length >= 2 
                    ? `${((calculations[0].weight - calculations[1].weight)).toFixed(1)}kg`
                    : 'N/A'
                  }
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-3">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-xs text-gray-500">Metas Ativas</p>
                <p className="font-semibold">
                  {patient.goals && typeof patient.goals === 'object' 
                    ? ((patient.goals as any).customGoals?.filter((g: any) => g.status === 'active')?.length || 0)
                    : 0
                  }
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerateReport}
          disabled={isGenerating}
          className="w-full"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Gerando Relatório...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Gerar e Baixar Relatório
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PatientReports;
