
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface ConsultationFormProps {
  formData: {
    weight: string;
    height: string;
    age: string;
    sex: string;
    objective: string;
    profile: string;
    activityLevel: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const ConsultationForm: React.FC<ConsultationFormProps> = ({
  formData,
  handleInputChange,
  handleSelectChange,
  onSubmit
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="weight">Peso (kg)*</Label>
        <Input
          id="weight"
          name="weight"
          type="number"
          step="0.1"
          min="30"
          max="300"
          value={formData.weight}
          onChange={handleInputChange}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="height">Altura (cm)*</Label>
        <Input
          id="height"
          name="height"
          type="number"
          step="1"
          min="100"
          max="250"
          value={formData.height}
          onChange={handleInputChange}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="age">Idade (anos)*</Label>
        <Input
          id="age"
          name="age"
          type="number"
          step="1"
          min="1"
          max="120"
          value={formData.age}
          onChange={handleInputChange}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label>Sexo*</Label>
        <RadioGroup 
          value={formData.sex} 
          onValueChange={(value) => handleSelectChange('sex', value)}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="M" id="sex-m" />
            <Label htmlFor="sex-m">Masculino</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="F" id="sex-f" />
            <Label htmlFor="sex-f">Feminino</Label>
          </div>
        </RadioGroup>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="objective">Objetivo*</Label>
        <Select 
          value={formData.objective} 
          onValueChange={(value) => handleSelectChange('objective', value)}
        >
          <SelectTrigger id="objective">
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="emagrecimento">Emagrecimento</SelectItem>
            <SelectItem value="manutenção">Manutenção</SelectItem>
            <SelectItem value="hipertrofia">Hipertrofia</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label>Perfil*</Label>
        <RadioGroup 
          value={formData.profile} 
          onValueChange={(value) => handleSelectChange('profile', value)}
          className="flex flex-col space-y-1"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="magro" id="profile-magro" />
            <Label htmlFor="profile-magro">Magro</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="obeso" id="profile-obeso" />
            <Label htmlFor="profile-obeso">Obeso</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="atleta" id="profile-atleta" />
            <Label htmlFor="profile-atleta">Atleta</Label>
          </div>
        </RadioGroup>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="activityLevel">Nível de Atividade*</Label>
        <Select 
          value={formData.activityLevel} 
          onValueChange={(value) => handleSelectChange('activityLevel', value)}
        >
          <SelectTrigger id="activityLevel">
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sedentário">Sedentário</SelectItem>
            <SelectItem value="moderado">Moderado</SelectItem>
            <SelectItem value="alto">Alto</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="pt-4">
        <Button 
          type="submit" 
          className="w-full bg-nutri-green hover:bg-nutri-green-dark"
        >
          Gerar Plano Alimentar
        </Button>
      </div>
    </form>
  );
};

export default ConsultationForm;
