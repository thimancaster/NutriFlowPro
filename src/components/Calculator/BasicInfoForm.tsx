
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { User } from 'lucide-react';
import { Patient, ConsultationData } from '@/types';

interface BasicInfoFormProps {
  patient: Patient;
  onFormChange: (data: Partial<ConsultationData>) => void;
  disabled?: boolean;
}

const BasicInfoForm: React.FC<BasicInfoFormProps> = ({
  patient,
  onFormChange,
  disabled = false
}) => {
  const [formData, setFormData] = useState({
    weight: '',
    height: '',
    age: '',
    gender: '',
    activity_level: '',
    goal: ''
  });

  const handleInputChange = (field: string, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onFormChange(newData);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="weight">Peso (kg)</Label>
          <Input
            id="weight"
            type="number"
            value={formData.weight}
            onChange={(e) => handleInputChange('weight', e.target.value)}
            disabled={disabled}
            placeholder="Ex: 70"
          />
        </div>
        
        <div>
          <Label htmlFor="height">Altura (cm)</Label>
          <Input
            id="height"
            type="number"
            value={formData.height}
            onChange={(e) => handleInputChange('height', e.target.value)}
            disabled={disabled}
            placeholder="Ex: 170"
          />
        </div>
        
        <div>
          <Label htmlFor="age">Idade (anos)</Label>
          <Input
            id="age"
            type="number"
            value={formData.age}
            onChange={(e) => handleInputChange('age', e.target.value)}
            disabled={disabled}
            placeholder="Ex: 30"
          />
        </div>
      </div>

      <div>
        <Label>Sexo</Label>
        <RadioGroup 
          value={formData.gender} 
          onValueChange={(value) => handleInputChange('gender', value)}
          disabled={disabled}
          className="flex flex-row space-x-6 mt-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="male" id="male" />
            <Label htmlFor="male">Masculino</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="female" id="female" />
            <Label htmlFor="female">Feminino</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="activity_level">Nível de Atividade</Label>
          <Select value={formData.activity_level} onValueChange={(value) => handleInputChange('activity_level', value)} disabled={disabled}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sedentary">Sedentário</SelectItem>
              <SelectItem value="lightly_active">Levemente ativo</SelectItem>
              <SelectItem value="moderately_active">Moderadamente ativo</SelectItem>
              <SelectItem value="very_active">Muito ativo</SelectItem>
              <SelectItem value="extra_active">Extremamente ativo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="goal">Objetivo</Label>
          <Select value={formData.goal} onValueChange={(value) => handleInputChange('goal', value)} disabled={disabled}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weight_loss">Perda de peso</SelectItem>
              <SelectItem value="maintenance">Manutenção</SelectItem>
              <SelectItem value="weight_gain">Ganho de peso</SelectItem>
              <SelectItem value="muscle_gain">Ganho de massa muscular</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default BasicInfoForm;
