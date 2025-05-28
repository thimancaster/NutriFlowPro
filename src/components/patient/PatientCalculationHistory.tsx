
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { calculationHistoryService, CalculationHistory } from '@/services/calculationHistoryService';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Trash2, Eye, Edit3, TrendingUp, Calculator } from 'lucide-react';

interface PatientCalculationHistoryProps {
  patientId: string;
}

const PatientCalculationHistory: React.FC<PatientCalculationHistoryProps> = ({ patientId }) => {
  const { toast } = useToast();
  const [period, setPeriod] = useState<'month' | '3months' | '6months' | 'year' | 'all'>('all');
  const [selectedCalculation, setSelectedCalculation] = useState<CalculationHistory | null>(null);
  const [editingNotes, setEditingNotes] = useState<string>('');

  const { data: calculations, isLoading, refetch } = useQuery({
    queryKey: ['patient-calculation-history', patientId, period],
    queryFn: () => calculationHistoryService.getPatientHistory(patientId, period),
  });

  const handleDeleteCalculation = async (calculationId: string) => {
    try {
      await calculationHistoryService.deleteCalculation(calculationId);
      toast({
        title: 'Cálculo excluído',
        description: 'O registro foi removido com sucesso.',
      });
      refetch();
    } catch (error) {
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir o registro.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateNotes = async () => {
    if (!selectedCalculation) return;

    try {
      await calculationHistoryService.updateNotes(selectedCalculation.id, editingNotes);
      toast({
        title: 'Observações atualizadas',
        description: 'As observações foram salvas com sucesso.',
      });
      setSelectedCalculation(null);
      refetch();
    } catch (error) {
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar as observações.',
        variant: 'destructive',
      });
    }
  };

  const getObjectiveBadgeColor = (objective: string) => {
    switch (objective.toLowerCase()) {
      case 'emagrecimento':
        return 'bg-red-100 text-red-800';
      case 'hipertrofia':
        return 'bg-green-100 text-green-800';
      case 'manutenção':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProfileBadgeColor = (profile: string) => {
    switch (profile.toLowerCase()) {
      case 'eutrofico':
        return 'bg-green-100 text-green-800';
      case 'sobrepeso_obesidade':
        return 'bg-orange-100 text-orange-800';
      case 'atleta':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Histórico de Cálculos
          </CardTitle>
          <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Selecionar período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Último mês</SelectItem>
              <SelectItem value="3months">Últimos 3 meses</SelectItem>
              <SelectItem value="6months">Últimos 6 meses</SelectItem>
              <SelectItem value="year">Último ano</SelectItem>
              <SelectItem value="all">Todos os registros</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {!calculations || calculations.length === 0 ? (
          <div className="text-center py-8">
            <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum cálculo encontrado para este período.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {calculations.map((calculation) => (
              <div key={calculation.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">
                      {formatDistanceToNow(new Date(calculation.calculation_date), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                    <Badge className={getObjectiveBadgeColor(calculation.objective)}>
                      {calculation.objective}
                    </Badge>
                    <Badge className={getProfileBadgeColor(calculation.body_profile)}>
                      {calculation.body_profile}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Detalhes do Cálculo</DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-2">Dados Antropométricos</h4>
                            <p>Peso: {calculation.weight} kg</p>
                            <p>Altura: {calculation.height} cm</p>
                            <p>Idade: {calculation.age} anos</p>
                            <p>Sexo: {calculation.sex === 'M' ? 'Masculino' : 'Feminino'}</p>
                            <p>Atividade: {calculation.activity_level}</p>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Resultados</h4>
                            <p>TMB: {calculation.tmb} kcal</p>
                            <p>GET: {calculation.get} kcal</p>
                            <p>VET: {calculation.vet} kcal</p>
                            <p>Fórmula: {calculation.formula_used}</p>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Macronutrientes (g)</h4>
                            <p>Proteínas: {calculation.protein_g}g ({calculation.protein_kcal} kcal)</p>
                            <p>Carboidratos: {calculation.carbs_g}g ({calculation.carbs_kcal} kcal)</p>
                            <p>Gorduras: {calculation.fat_g}g ({calculation.fat_kcal} kcal)</p>
                          </div>
                          {calculation.notes && (
                            <div>
                              <h4 className="font-medium mb-2">Observações</h4>
                              <p className="text-sm text-gray-600">{calculation.notes}</p>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedCalculation(calculation);
                            setEditingNotes(calculation.notes || '');
                          }}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Editar Observações</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Textarea
                            value={editingNotes}
                            onChange={(e) => setEditingNotes(e.target.value)}
                            placeholder="Adicione observações sobre este cálculo..."
                            rows={4}
                          />
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setSelectedCalculation(null)}>
                              Cancelar
                            </Button>
                            <Button onClick={handleUpdateNotes}>
                              Salvar
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteCalculation(calculation.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">TMB:</span>
                    <span className="ml-2 font-medium">{calculation.tmb} kcal</span>
                  </div>
                  <div>
                    <span className="text-gray-500">GET:</span>
                    <span className="ml-2 font-medium">{calculation.get} kcal</span>
                  </div>
                  <div>
                    <span className="text-gray-500">VET:</span>
                    <span className="ml-2 font-medium">{calculation.vet} kcal</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Peso:</span>
                    <span className="ml-2 font-medium">{calculation.weight} kg</span>
                  </div>
                </div>

                {calculation.notes && (
                  <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                    <span className="text-gray-500">Obs:</span> {calculation.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PatientCalculationHistory;
