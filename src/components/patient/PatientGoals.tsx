import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Patient, PatientGoals } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface PatientGoalsProps {
  patient: Patient;
  onUpdatePatient: (data: Partial<Patient>) => Promise<void>;
}

const PatientGoals: React.FC<PatientGoalsProps> = ({ patient, onUpdatePatient }) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [goals, setGoals] = useState<PatientGoals>(patient.goals || {});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setGoals(prevGoals => ({
      ...prevGoals,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setGoals(prevGoals => ({
      ...prevGoals,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      await onUpdatePatient({ 
        goals: {
          ...goals,
          customGoals: Array.isArray(goals.customGoals) 
            ? goals.customGoals.join(', ') 
            : goals.customGoals || ''
        }
      });
      setIsEditing(false);
      toast({
        title: 'Objetivos atualizados',
        description: 'Os objetivos do paciente foram salvos com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar os objetivos.',
        variant: 'destructive'
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Objetivos do Paciente</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="objective">Objetivo Principal</Label>
              <Select onValueChange={(value) => handleSelectChange('objective', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" defaultValue={goals.objective || ''} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manutencao">Manutenção</SelectItem>
                  <SelectItem value="emagrecimento">Emagrecimento</SelectItem>
                  <SelectItem value="hipertrofia">Hipertrofia</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="profile">Perfil</Label>
              <Select onValueChange={(value) => handleSelectChange('profile', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" defaultValue={goals.profile || ''} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="eutrofico">Eutrófico</SelectItem>
                  <SelectItem value="obeso_sobrepeso">Obeso/Sobrepeso</SelectItem>
                  <SelectItem value="atleta">Atleta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="activityLevel">Nível de Atividade</Label>
              <Select onValueChange={(value) => handleSelectChange('activityLevel', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" defaultValue={goals.activityLevel || ''} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentario">Sedentário</SelectItem>
                  <SelectItem value="leve">Leve</SelectItem>
                  <SelectItem value="moderado">Moderado</SelectItem>
                  <SelectItem value="muito_ativo">Muito Ativo</SelectItem>
                  <SelectItem value="extremamente_ativo">Extremamente Ativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="target_weight">Peso Alvo (kg)</Label>
              <Input
                type="number"
                name="target_weight"
                value={goals.target_weight || ''}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="customGoals">Objetivos Personalizados</Label>
              <Textarea
                name="customGoals"
                value={goals.customGoals || ''}
                onChange={handleInputChange}
                placeholder="Descreva os objetivos específicos do paciente"
              />
            </div>
            <div>
              <Label htmlFor="notes">Notas Adicionais</Label>
              <Textarea
                name="notes"
                value={goals.notes || ''}
                onChange={handleInputChange}
                placeholder="Informações adicionais relevantes"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setIsEditing(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>Salvar</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p><strong>Objetivo Principal:</strong> {goals.objective || 'Não definido'}</p>
            <p><strong>Perfil:</strong> {goals.profile || 'Não definido'}</p>
            <p><strong>Nível de Atividade:</strong> {goals.activityLevel || 'Não definido'}</p>
            <p><strong>Peso Alvo:</strong> {goals.target_weight || 'Não definido'}</p>
            <p><strong>Objetivos Personalizados:</strong> {goals.customGoals || 'Nenhum'}</p>
            <p><strong>Notas:</strong> {goals.notes || 'Nenhuma'}</p>
            <Button onClick={() => setIsEditing(true)}>Editar Objetivos</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PatientGoals;
