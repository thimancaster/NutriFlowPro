
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Target, Save, Plus, X, AlertTriangle, CheckCircle } from 'lucide-react';
import { Patient } from '@/types';

interface Goal {
  id: string;
  type: 'weight' | 'body_fat' | 'muscle_mass' | 'custom';
  name: string;
  target_value: number;
  current_value?: number;
  unit: string;
  target_date?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'achieved' | 'paused';
  notes?: string;
}

interface PatientGoalsProps {
  patient: Patient;
  onUpdatePatient: (data: Partial<Patient>) => Promise<void>;
}

const PatientGoals: React.FC<PatientGoalsProps> = ({ patient, onUpdatePatient }) => {
  const { toast } = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [newGoal, setNewGoal] = useState<Partial<Goal>>({
    type: 'weight',
    priority: 'medium',
    status: 'active',
    unit: 'kg'
  });

  useEffect(() => {
    // Load goals from patient data
    if (patient.goals && typeof patient.goals === 'object') {
      const goalsData = patient.goals as any;
      if (goalsData.customGoals) {
        setGoals(goalsData.customGoals);
      }
    }
  }, [patient]);

  const handleAddGoal = () => {
    if (!newGoal.name || !newGoal.target_value) {
      toast({
        title: 'Erro',
        description: 'Nome e valor da meta são obrigatórios',
        variant: 'destructive'
      });
      return;
    }

    const goal: Goal = {
      id: Date.now().toString(),
      type: newGoal.type || 'custom',
      name: newGoal.name,
      target_value: newGoal.target_value,
      unit: newGoal.unit || '',
      target_date: newGoal.target_date,
      priority: newGoal.priority || 'medium',
      status: 'active',
      notes: newGoal.notes
    };

    const updatedGoals = [...goals, goal];
    setGoals(updatedGoals);
    saveGoals(updatedGoals);
    
    setNewGoal({
      type: 'weight',
      priority: 'medium',
      status: 'active',
      unit: 'kg'
    });
  };

  const handleRemoveGoal = (goalId: string) => {
    const updatedGoals = goals.filter(g => g.id !== goalId);
    setGoals(updatedGoals);
    saveGoals(updatedGoals);
  };

  const handleUpdateGoalStatus = (goalId: string, status: Goal['status']) => {
    const updatedGoals = goals.map(goal => 
      goal.id === goalId ? { ...goal, status } : goal
    );
    setGoals(updatedGoals);
    saveGoals(updatedGoals);
  };

  const saveGoals = async (updatedGoals: Goal[]) => {
    try {
      const currentGoals = patient.goals || {};
      await onUpdatePatient({
        goals: {
          ...currentGoals,
          customGoals: updatedGoals
        }
      });
      
      toast({
        title: 'Metas atualizadas',
        description: 'As metas do paciente foram salvas com sucesso'
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar as metas',
        variant: 'destructive'
      });
    }
  };

  const getPriorityColor = (priority: Goal['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: Goal['status']) => {
    switch (status) {
      case 'achieved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'paused': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default: return <Target className="h-4 w-4 text-blue-600" />;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Metas do Paciente
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Plus className="h-4 w-4 mr-1" />
            {isEditing ? 'Cancelar' : 'Nova Meta'}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isEditing && (
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="goalType">Tipo</Label>
                <Select
                  value={newGoal.type}
                  onValueChange={(value: Goal['type']) => setNewGoal({ ...newGoal, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weight">Peso</SelectItem>
                    <SelectItem value="body_fat">Gordura Corporal</SelectItem>
                    <SelectItem value="muscle_mass">Massa Muscular</SelectItem>
                    <SelectItem value="custom">Personalizada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="goalName">Nome da Meta</Label>
                <Input
                  id="goalName"
                  value={newGoal.name || ''}
                  onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                  placeholder="Ex: Reduzir peso para 70kg"
                />
              </div>
              
              <div>
                <Label htmlFor="targetValue">Valor Alvo</Label>
                <Input
                  id="targetValue"
                  type="number"
                  value={newGoal.target_value || ''}
                  onChange={(e) => setNewGoal({ ...newGoal, target_value: parseFloat(e.target.value) })}
                  placeholder="70"
                />
              </div>
              
              <div>
                <Label htmlFor="unit">Unidade</Label>
                <Input
                  id="unit"
                  value={newGoal.unit || ''}
                  onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value })}
                  placeholder="kg, %, cm..."
                />
              </div>
              
              <div>
                <Label htmlFor="targetDate">Data Alvo</Label>
                <Input
                  id="targetDate"
                  type="date"
                  value={newGoal.target_date || ''}
                  onChange={(e) => setNewGoal({ ...newGoal, target_date: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="priority">Prioridade</Label>
                <Select
                  value={newGoal.priority}
                  onValueChange={(value: Goal['priority']) => setNewGoal({ ...newGoal, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="mt-4">
              <Label htmlFor="notes">Observações</Label>
              <Input
                id="notes"
                value={newGoal.notes || ''}
                onChange={(e) => setNewGoal({ ...newGoal, notes: e.target.value })}
                placeholder="Observações adicionais..."
              />
            </div>
            
            <div className="flex gap-2 mt-4">
              <Button onClick={handleAddGoal} size="sm">
                <Save className="h-4 w-4 mr-1" />
                Salvar Meta
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                size="sm"
              >
                Cancelar
              </Button>
            </div>
          </Card>
        )}
        
        <div className="space-y-3">
          {goals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma meta definida</p>
              <p className="text-sm">Clique em "Nova Meta" para começar</p>
            </div>
          ) : (
            goals.map((goal) => (
              <Card key={goal.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(goal.status)}
                      <h4 className="font-medium">{goal.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs border ${getPriorityColor(goal.priority)}`}>
                        {goal.priority === 'high' ? 'Alta' : goal.priority === 'medium' ? 'Média' : 'Baixa'}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        <strong>Alvo:</strong> {goal.target_value} {goal.unit}
                        {goal.target_date && (
                          <span className="ml-4">
                            <strong>Data:</strong> {new Date(goal.target_date).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </p>
                      {goal.notes && (
                        <p><strong>Observações:</strong> {goal.notes}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    <Select
                      value={goal.status}
                      onValueChange={(value: Goal['status']) => handleUpdateGoalStatus(goal.id, value)}
                    >
                      <SelectTrigger className="w-32 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Ativa</SelectItem>
                        <SelectItem value="achieved">Alcançada</SelectItem>
                        <SelectItem value="paused">Pausada</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveGoal(goal.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientGoals;
