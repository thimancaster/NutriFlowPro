
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator } from 'lucide-react';
import { Profile } from '@/types/consultation';
import { PROFILE_OPTIONS, getProfileLabel } from '../utils/profileUtils';

interface CalculatorFormProps {
  weight: number;
  height: number;
  age: number;
  sex: 'M' | 'F';
  profile: Profile;
  isCalculating: boolean;
  onInputChange: (field: string, value: number) => void;
  onSexChange: (sex: 'M' | 'F') => void;
  onProfileChange: (profile: Profile) => void;
  onCalculate: () => void;
  patientSelected: boolean;
}

const CalculatorForm: React.FC<CalculatorFormProps> = ({
  weight,
  height,
  age,
  sex,
  profile,
  isCalculating,
  onInputChange,
  onSexChange,
  onProfileChange,
  onCalculate,
  patientSelected
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Dados Básicos e Perfil
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {patientSelected && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-green-800 text-sm">
              ✓ Paciente selecionado. Os dados foram preenchidos automaticamente.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="weight">Peso (kg) *</Label>
            <Input
              id="weight"
              type="number"
              value={weight}
              onChange={(e) => onInputChange('weight', Number(e.target.value))}
              placeholder="Ex: 70"
              min="1"
              max="500"
              step="0.1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="height">Altura (cm) *</Label>
            <Input
              id="height"
              type="number"
              value={height}
              onChange={(e) => onInputChange('height', Number(e.target.value))}
              placeholder="Ex: 170"
              min="50"
              max="250"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="age">Idade *</Label>
            <Input
              id="age"
              type="number"
              value={age}
              onChange={(e) => onInputChange('age', Number(e.target.value))}
              placeholder="Ex: 30"
              min="1"
              max="120"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="sex">Sexo *</Label>
            <Select value={sex} onValueChange={(value) => onSexChange(value as 'M' | 'F')}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o sexo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="M">Masculino</SelectItem>
                <SelectItem value="F">Feminino</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile">Perfil Corporal *</Label>
            <Select 
              value={profile} 
              onValueChange={(value) => {
                console.log('Profile selected:', value);
                onProfileChange(value as Profile);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o perfil">
                  {profile ? getProfileLabel(profile) : "Selecione o perfil"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {PROFILE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Informações sobre Perfis:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li><strong>Eutrófico:</strong> Peso normal, composição corporal adequada</li>
            <li><strong>Sobrepeso/Obesidade:</strong> Excesso de peso, necessita redução calórica</li>
            <li><strong>Atleta:</strong> Alta demanda energética e proteica</li>
          </ul>
        </div>

        <Button 
          onClick={onCalculate} 
          disabled={isCalculating || !weight || !height || !age}
          className="w-full"
          size="lg"
        >
          {isCalculating ? 'Calculando...' : 'Calcular TMB e Necessidades'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default CalculatorForm;
