
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { calculationHistoryService, CalculationHistory } from '@/services/calculationHistoryService';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TrendingUp, TrendingDown, Minus, BarChart3, Eye } from 'lucide-react';

interface PatientCalculationComparisonProps {
  patientId: string;
}

const PatientCalculationComparison: React.FC<PatientCalculationComparisonProps> = ({ patientId }) => {
  const [selectedCalculation1, setSelectedCalculation1] = useState<string>('');
  const [selectedCalculation2, setSelectedCalculation2] = useState<string>('');
  const [showComparisonDialog, setShowComparisonDialog] = useState(false);

  const { data: calculations, isLoading } = useQuery({
    queryKey: ['patient-calculation-history', patientId, 'all'],
    queryFn: () => calculationHistoryService.getPatientHistory(patientId, 'all'),
  });

  const calculation1 = calculations?.find(c => c.id === selectedCalculation1);
  const calculation2 = calculations?.find(c => c.id === selectedCalculation2);

  const canCompare = calculation1 && calculation2 && calculation1.id !== calculation2.id;

  const getChangeIndicator = (current: number, previous: number) => {
    const difference = current - previous;
    const percentage = ((difference / previous) * 100).toFixed(1);
    
    if (difference > 0) {
      return {
        icon: <TrendingUp className="h-4 w-4 text-red-500" />,
        text: `+${difference.toFixed(1)} (+${percentage}%)`,
        color: 'text-red-600'
      };
    } else if (difference < 0) {
      return {
        icon: <TrendingDown className="h-4 w-4 text-green-500" />,
        text: `${difference.toFixed(1)} (${percentage}%)`,
        color: 'text-green-600'
      };
    } else {
      return {
        icon: <Minus className="h-4 w-4 text-gray-500" />,
        text: 'Sem alteração',
        color: 'text-gray-600'
      };
    }
  };

  const ComparisonTable = ({ calc1, calc2 }: { calc1: CalculationHistory; calc2: CalculationHistory }) => {
    const metrics = [
      { label: 'Peso (kg)', key: 'weight' },
      { label: 'Altura (cm)', key: 'height' },
      { label: 'TMB (kcal)', key: 'tmb' },
      { label: 'GET (kcal)', key: 'get' },
      { label: 'VET (kcal)', key: 'vet' },
      { label: 'Proteínas (g)', key: 'protein_g' },
      { label: 'Carboidratos (g)', key: 'carbs_g' },
      { label: 'Gorduras (g)', key: 'fat_g' }
    ];

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-200 p-3 text-left">Métrica</th>
              <th className="border border-gray-200 p-3 text-center">
                {new Date(calc1.calculation_date).toLocaleDateString('pt-BR')}
                <br />
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(calc1.calculation_date), { addSuffix: true, locale: ptBR })}
                </span>
              </th>
              <th className="border border-gray-200 p-3 text-center">
                {new Date(calc2.calculation_date).toLocaleDateString('pt-BR')}
                <br />
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(calc2.calculation_date), { addSuffix: true, locale: ptBR })}
                </span>
              </th>
              <th className="border border-gray-200 p-3 text-center">Variação</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((metric) => {
              const value1 = calc1[metric.key as keyof CalculationHistory] as number;
              const value2 = calc2[metric.key as keyof CalculationHistory] as number;
              const change = getChangeIndicator(value2, value1);
              
              return (
                <tr key={metric.key} className="hover:bg-gray-50">
                  <td className="border border-gray-200 p-3 font-medium">{metric.label}</td>
                  <td className="border border-gray-200 p-3 text-center">{value1}</td>
                  <td className="border border-gray-200 p-3 text-center">{value2}</td>
                  <td className="border border-gray-200 p-3 text-center">
                    <div className={`flex items-center justify-center gap-1 ${change.color}`}>
                      {change.icon}
                      <span className="text-sm">{change.text}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-gray-500">Carregando histórico...</p>
        </CardContent>
      </Card>
    );
  }

  if (!calculations || calculations.length < 2) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            É necessário ter pelo menos 2 cálculos salvos para fazer comparações.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Comparação entre Atendimentos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Seleção de cálculos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Primeiro Atendimento</label>
            <Select value={selectedCalculation1} onValueChange={setSelectedCalculation1}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar atendimento" />
              </SelectTrigger>
              <SelectContent>
                {calculations.map((calc) => (
                  <SelectItem key={calc.id} value={calc.id}>
                    <div className="flex items-center gap-2">
                      <span>{new Date(calc.calculation_date).toLocaleDateString('pt-BR')}</span>
                      <Badge variant="outline" className="text-xs">
                        {calc.objective}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Segundo Atendimento</label>
            <Select value={selectedCalculation2} onValueChange={setSelectedCalculation2}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar atendimento" />
              </SelectTrigger>
              <SelectContent>
                {calculations.map((calc) => (
                  <SelectItem key={calc.id} value={calc.id}>
                    <div className="flex items-center gap-2">
                      <span>{new Date(calc.calculation_date).toLocaleDateString('pt-BR')}</span>
                      <Badge variant="outline" className="text-xs">
                        {calc.objective}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Resumo rápido quando ambos estão selecionados */}
        {canCompare && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-3">Resumo da Comparação</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Variação de Peso</p>
                <div className="flex items-center gap-1">
                  {(() => {
                    const change = getChangeIndicator(calculation2!.weight, calculation1!.weight);
                    return (
                      <>
                        {change.icon}
                        <span className={change.color}>{change.text}</span>
                      </>
                    );
                  })()}
                </div>
              </div>

              <div>
                <p className="text-gray-600">Variação VET</p>
                <div className="flex items-center gap-1">
                  {(() => {
                    const change = getChangeIndicator(calculation2!.vet, calculation1!.vet);
                    return (
                      <>
                        {change.icon}
                        <span className={change.color}>{change.text}</span>
                      </>
                    );
                  })()}
                </div>
              </div>

              <div>
                <p className="text-gray-600">Variação Proteína</p>
                <div className="flex items-center gap-1">
                  {(() => {
                    const change = getChangeIndicator(calculation2!.protein_g, calculation1!.protein_g);
                    return (
                      <>
                        {change.icon}
                        <span className={change.color}>{change.text}</span>
                      </>
                    );
                  })()}
                </div>
              </div>

              <div>
                <p className="text-gray-600">Período</p>
                <p className="font-medium">
                  {Math.abs(
                    Math.ceil(
                      (new Date(calculation2!.calculation_date).getTime() - 
                       new Date(calculation1!.calculation_date).getTime()) / 
                      (1000 * 60 * 60 * 24)
                    )
                  )} dias
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Botão para comparação detalhada */}
        {canCompare && (
          <Dialog open={showComparisonDialog} onOpenChange={setShowComparisonDialog}>
            <DialogTrigger asChild>
              <Button className="w-full">
                <Eye className="h-4 w-4 mr-2" />
                Ver Comparação Detalhada
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Comparação Detalhada</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <ComparisonTable calc1={calculation1!} calc2={calculation2!} />
                
                {/* Notas dos atendimentos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {calculation1?.notes && (
                    <div>
                      <h5 className="font-medium mb-2">
                        Observações - {new Date(calculation1.calculation_date).toLocaleDateString('pt-BR')}
                      </h5>
                      <div className="bg-gray-50 p-3 rounded text-sm">
                        {calculation1.notes}
                      </div>
                    </div>
                  )}
                  
                  {calculation2?.notes && (
                    <div>
                      <h5 className="font-medium mb-2">
                        Observações - {new Date(calculation2.calculation_date).toLocaleDateString('pt-BR')}
                      </h5>
                      <div className="bg-gray-50 p-3 rounded text-sm">
                        {calculation2.notes}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Lista de cálculos recentes para referência */}
        <div>
          <h4 className="font-medium mb-3">Atendimentos Recentes</h4>
          <div className="space-y-2">
            {calculations.slice(0, 5).map((calc) => (
              <div
                key={calc.id}
                className={`flex justify-between items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedCalculation1 === calc.id || selectedCalculation2 === calc.id
                    ? 'bg-blue-50 border-blue-200'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => {
                  if (!selectedCalculation1) {
                    setSelectedCalculation1(calc.id);
                  } else if (!selectedCalculation2 && selectedCalculation1 !== calc.id) {
                    setSelectedCalculation2(calc.id);
                  }
                }}
              >
                <div>
                  <p className="font-medium">
                    {new Date(calc.calculation_date).toLocaleDateString('pt-BR')}
                  </p>
                  <p className="text-sm text-gray-500">
                    Peso: {calc.weight}kg | VET: {calc.vet} kcal
                  </p>
                </div>
                <Badge variant="outline">{calc.objective}</Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientCalculationComparison;
