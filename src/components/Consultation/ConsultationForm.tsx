import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ConsultationType, ConsultationStatus, ActivityLevel, Objective, Profile, Sex } from "@/types/consultation";

export interface ConsultationFormProps {
  formData: {
    weight: string;
    height: string;
    age: string;
    sex: Sex;
    objective: Objective;
    profile: Profile;
    activityLevel: ActivityLevel;
    consultationType?: ConsultationType;
    consultationStatus?: ConsultationStatus;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  lastAutoSave?: Date | null;
  autoSaveStatus?: "idle" | "saving" | "success" | "error";
}

const ConsultationForm: React.FC<ConsultationFormProps> = ({ 
  formData, 
  handleInputChange, 
  handleSelectChange, 
  onSubmit,
  lastAutoSave,
  autoSaveStatus
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="weight">Peso (kg)</Label>
          <Input
            type="text"
            id="weight"
            name="weight"
            value={formData.weight}
            onChange={handleInputChange}
            placeholder="Peso em kg"
            className="w-full"
          />
        </div>
        
        <div>
          <Label htmlFor="height">Altura (cm)</Label>
          <Input
            type="text"
            id="height"
            name="height"
            value={formData.height}
            onChange={handleInputChange}
            placeholder="Altura em cm"
            className="w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="age">Idade</Label>
          <Input
            type="text"
            id="age"
            name="age"
            value={formData.age}
            onChange={handleInputChange}
            placeholder="Idade"
            className="w-full"
          />
        </div>
        
        <div>
          <Label htmlFor="sex">Sexo</Label>
          <Select value={formData.sex} onValueChange={(value) => handleSelectChange('sex', value)}>
            <SelectTrigger id="sex">
              <SelectValue placeholder="Selecione o sexo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="M">Masculino</SelectItem>
              <SelectItem value="F">Feminino</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="objective">Objetivo</Label>
          <Select value={formData.objective} onValueChange={(value) => handleSelectChange('objective', value as Objective)}>
            <SelectTrigger id="objective">
              <SelectValue placeholder="Selecione o objetivo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="emagrecimento">Emagrecimento</SelectItem>
              <SelectItem value="manutenção">Manutenção</SelectItem>
              <SelectItem value="hipertrofia">Hipertrofia</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="profile">Perfil</Label>
          <Select value={formData.profile} onValueChange={(value) => handleSelectChange('profile', value as Profile)}>
            <SelectTrigger id="profile">
              <SelectValue placeholder="Selecione o perfil" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="eutrofico">Eutrófico (Peso normal)</SelectItem>
              <SelectItem value="sobrepeso_obesidade">Sobrepeso/Obesidade</SelectItem>
              <SelectItem value="atleta">Atleta</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="activityLevel">Nível de Atividade</Label>
          <Select value={formData.activityLevel} onValueChange={(value) => handleSelectChange('activityLevel', value as ActivityLevel)}>
            <SelectTrigger id="activityLevel">
              <SelectValue placeholder="Selecione o nível" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sedentario">Sedentário</SelectItem>
              <SelectItem value="leve">Leve</SelectItem>
              <SelectItem value="moderado">Moderado</SelectItem>
              <SelectItem value="intenso">Intenso</SelectItem>
              <SelectItem value="muito_intenso">Muito Intenso</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="consultationType">Tipo de Consulta</Label>
          <Select 
            value={formData.consultationType || 'primeira_consulta'} 
            onValueChange={(value) => handleSelectChange('consultationType', value as ConsultationType)}
          >
            <SelectTrigger id="consultationType">
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="primeira_consulta">Primeira Consulta</SelectItem>
              <SelectItem value="retorno">Retorno</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <Label htmlFor="consultationStatus">Status da Consulta</Label>
        <Select 
          value={formData.consultationStatus || 'em_andamento'} 
          onValueChange={(value) => handleSelectChange('consultationStatus', value as ConsultationStatus)}
        >
          <SelectTrigger id="consultationStatus">
            <SelectValue placeholder="Selecione o status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="em_andamento">Em Andamento</SelectItem>
            <SelectItem value="completo">Completo</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {lastAutoSave && (
        <div className="text-xs text-gray-500 italic">
          Último salvamento automático: {lastAutoSave.toLocaleTimeString()}
        </div>
      )}
      
      {autoSaveStatus === 'saving' && (
        <div className="text-xs text-gray-500 italic">
          Salvando alterações...
        </div>
      )}
      
      {autoSaveStatus === 'success' && (
        <div className="text-xs text-green-500 italic">
          Alterações salvas com sucesso
        </div>
      )}
      
      {autoSaveStatus === 'error' && (
        <div className="text-xs text-red-500 italic">
          Erro ao salvar alterações
        </div>
      )}
      
      <Button type="submit" className="w-full">Calcular</Button>
    </form>
  );
};

export default ConsultationForm;
