import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Target, Plus, Edit, Trash, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { Patient } from '@/types';

interface Goal {
  id: string;
  name: string;
  type: 'weight' | 'body_fat' | 'muscle_mass' | 'custom';
  target_value: number;
  current_value?: number;
  unit: string;
  target_date?: string;
  status: 'active' | 'achieved' | 'paused';
  priority: 'low' | 'medium' | 'high';
  notes?: string;
  created_at: string;
}

interface PatientGoalsProps {
  patient: Patient;
  onUpdatePatient: (data: Partial<Patient>) => Promise<void>;
}

const PatientGoals: React.FC<PatientGoalsProps> = ({ patient, onUpdatePatient }) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [newGoal, setNewGoal] = useState<Partial<Goal>>({
    type: 'weight',
    status: 'active',
    priority: 'medium',
    unit: 'kg'
  });

  // Get goals from patient data, ensuring we have an array
  const goals: Goal[] = React.useMemo(() => {
    if (!patient.goals || typeof patient.goals !== 'object') return [];
    const goalsData = patient.goals as any;
    return goalsData.customGoals || [];
  }, [patient.goals]);

  const handleSaveGoal = async () => {
    if (!newGoal.name || !newGoal.target_value) {
      toast({
        title: 'Erro',
        description: 'Nome e valor alvo são obrigatórios',
        variant: 'destructive'
      });
      return;
    }

    const goalToSave: Goal = {
      id: editingGoal?.id || Date.now().toString(),
      name: newGoal.name!,
      type: newGoal.type || 'custom',
      target_value: newGoal.target_value!,
      current_value: newGoal.current_value,
      unit: newGoal.unit || 'kg',
      target_date: newGoal.target_date,
      status: newGoal.status || 'active',
      priority: newGoal.priority || 'medium',
      notes: newGoal.notes,
      created_at: editingGoal?.created_at || new Date().toISOString()
    };

    const updatedGoals = editingGoal
      ? goals.map(g => g.id === editingGoal.id ? goalToSave : g)
      : [...goals, goalToSave];

    try {
      await onUpdatePatient({
        goals: {
          ...patient.goals,
          customGoals: updatedGoals
        }
      });

      toast({
        title: 'Meta salva',
        description: editingGoal ? 'Meta atualizada com sucesso' : 'Nova meta criada com sucesso'
      });

      setIsEditing(false);
      setEditingGoal(null);
      setNewGoal({
        type: 'weight',
        status: 'active',
        priority: 'medium',
        unit: 'kg'
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar a meta',
        variant: 'destructive'
      });
    }
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setNewGoal({ ...goal });
    setIsEditing(true);
  };

  const handleDeleteGoal = async (goalId: string) => {
    const updatedGoals = goals.filter(g => g.id !== goalId);
    
    try {
      await onUpdatePatient({
        goals: {
          ...patient.goals,
          customGoals: updatedGoals
        }
      });

      toast({
        title: 'Meta removida',
        description: 'Meta excluída com sucesso'
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a meta',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateStatus = async (goalId: string, status: Goal['status']) => {
    const updatedGoals = goals.map(g => 
      g.id === goalId ? { ...g, status } : g
    );
    
    try {
      await onUpdatePatient({
        goals: {
          ...patient.goals,
          customGoals: updatedGoals
        }
      });

      toast({
        title: 'Status atualizado',
        description: `Meta marcada como ${status === 'achieved' ? 'alcançada' : status === 'paused' ? 'pausada' : 'ativa'}`
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status',
        variant: 'destructive'
      });
    }
  };

  const getStatusIcon = (status: Goal['status']) => {
    switch (status) {
      case 'achieved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'paused': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'active': return <Target className="h-4 w-4 text-blue-600" />;
    }
  };

  const getStatusColor = (status: Goal['status']) => {
    switch (status) {
      case 'achieved': return 'success';
      case 'paused': return 'warning';
      case 'active': return 'default';
    }
  };

  const getPriorityColor = (priority: Goal['priority']) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'secondary';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Metas do Paciente
            {goals.length > 0 && (
              <Badge variant="outline" className="ml-2">
                {goals.filter(g => g.status === 'active').length} ativas
              </Badge>
            )}
          </CardTitle>
          
          <Button
            onClick={() => setIsEditing(true)}
            size="sm"
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            Nova Meta
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Goal Form */}
        {isEditing && (
          <Card className="p-4 border-dashed">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Nome da Meta</label>
                  <input
                    type="text"
                    value={newGoal.name || ''}
                    onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    placeholder="Ex: Perder 5kg"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Tipo</label>
                  <select
                    value={newGoal.type}
                    onChange={(e) => setNewGoal({ ...newGoal, type: e.target.value as Goal['type'] })}
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                  >
                    <option value="weight">Peso</option>
                    <option value="body_fat">Gordura Corporal</option>
                    <option value="muscle_mass">Massa Muscular</option>
                    <option value="custom">Personalizada</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Valor Alvo</label>
                  <input
                    type="number"
                    value={newGoal.target_value || ''}
                    onChange={(e) => setNewGoal({ ...newGoal, target_value: parseFloat(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Unidade</label>
                  <input
                    type="text"
                    value={newGoal.unit || ''}
                    onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    placeholder="kg, %, cm..."
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Prioridade</label>
                  <select
                    value={newGoal.priority}
                    onChange={(e) => setNewGoal({ ...newGoal, priority: e.target.value as Goal['priority'] })}
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                  >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Data Alvo (opcional)</label>
                <input
                  type="date"
                  value={newGoal.target_date || ''}
                  onChange={(e) => setNewGoal({ ...newGoal, target_date: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Observações</label>
                <textarea
                  value={newGoal.notes || ''}
                  onChange={(e) => setNewGoal({ ...newGoal, notes: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  rows={2}
                  placeholder="Observações sobre a meta..."
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveGoal} size="sm">
                  {editingGoal ? 'Atualizar' : 'Salvar'} Meta
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setIsEditing(false);
                    setEditingGoal(null);
                    setNewGoal({
                      type: 'weight',
                      status: 'active',
                      priority: 'medium',
                      unit: 'kg'
                    });
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Goals List */}
        {goals.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Target className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>Nenhuma meta definida</p>
            <p className="text-sm">Clique em "Nova Meta" para começar</p>
          </div>
        ) : (
          <div className="space-y-3">
            {goals.map((goal) => (
              <Card key={goal.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(goal.status)}
                      <h4 className="font-medium">{goal.name}</h4>
                      <Badge variant={getStatusColor(goal.status) as any}>
                        {goal.status === 'achieved' ? 'Alcançada' : goal.status === 'paused' ? 'Pausada' : 'Ativa'}
                      </Badge>
                      <Badge variant={getPriorityColor(goal.priority) as any}>
                        {goal.priority === 'high' ? 'Alta' : goal.priority === 'medium' ? 'Média' : 'Baixa'}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Valor alvo: <strong>{goal.target_value} {goal.unit}</strong></p>
                      {goal.current_value && (
                        <p>Valor atual: <strong>{goal.current_value} {goal.unit}</strong></p>
                      )}
                      {goal.target_date && (
                        <p>Data alvo: <strong>{new Date(goal.target_date).toLocaleDateString('pt-BR')}</strong></p>
                      )}
                      {goal.notes && (
                        <p>Observações: {goal.notes}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {goal.status === 'active' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateStatus(goal.id, 'achieved')}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditGoal(goal)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteGoal(goal.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PatientGoals;
