import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import type { PatientGoals as PatientGoalsType } from '@/types';
import { Patient } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface PatientGoalsProps {
  patient: Patient;
  onUpdatePatient: (data: Partial<Patient>) => Promise<void>;
}

const PatientGoals: React.FC<PatientGoalsProps> = ({ patient, onUpdatePatient }) => {
  const [goals, setGoals] = useState<PatientGoalsType>(patient.goals || {});
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setGoals(prevGoals => ({ ...prevGoals, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setGoals(prevGoals => ({ ...prevGoals, [name]: value }));
  };

  const handleSave = async () => {
    try {
      await onUpdatePatient({ goals });
      toast({
        title: "Sucesso",
        description: "Metas do paciente atualizadas com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error?.message || "Erro ao atualizar metas do paciente.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Metas do Paciente</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="objective">Objetivo</Label>
          <Select onValueChange={(value) => handleSelectChange('objective', value)} defaultValue={goals.objective || ''}>
            <SelectTrigger>
              <SelectValue placeholder="Selecionar" />
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
          <Select onValueChange={(value) => handleSelectChange('profile', value)} defaultValue={goals.profile || ''}>
            <SelectTrigger>
              <SelectValue placeholder="Selecionar" />
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
          <Select onValueChange={(value) => handleSelectChange('activityLevel', value)} defaultValue={goals.activityLevel || ''}>
            <SelectTrigger>
              <SelectValue placeholder="Selecionar" />
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
            id="target_weight"
            name="target_weight"
            value={goals.target_weight || ''}
            onChange={handleChange}
            placeholder="Peso que o paciente deseja atingir"
          />
        </div>
        <div>
          <Label htmlFor="customGoals">Metas Personalizadas</Label>
          <Textarea
            id="customGoals"
            name="customGoals"
            value={goals.customGoals || ''}
            onChange={handleChange}
            placeholder="Outras metas específicas para o paciente..."
          />
        </div>
        <div>
          <Label htmlFor="notes">Notas</Label>
          <Textarea
            id="notes"
            name="notes"
            value={goals.notes || ''}
            onChange={handleChange}
            placeholder="Anotações adicionais sobre as metas do paciente..."
          />
        </div>
        <Button onClick={handleSave}>Salvar Metas</Button>
      </CardContent>
    </Card>
  );
};

export default PatientGoals;
