
import React from 'react';
import { 
  Label, 
  Input, 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
  Button
} from '@/components/ui';
import { ArrowRight } from 'lucide-react';
import { Profile } from '@/types/consultation';
import { stringToProfile } from '@/components/calculator/utils/profileUtils';

interface CalculatorFormProps {
  weight: number | '';
  height: number | '';
  age: number | '';
  sex: 'M' | 'F';
  profile: Profile;
  isCalculating: boolean;
  onInputChange: (name: string, value: number | '') => void;
  onSexChange: (value: 'M' | 'F') => void;
  onProfileChange: (value: string) => void;
  onCalculate: () => void;
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
  onCalculate
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="weight">Peso (kg) *</Label>
          <Input
            id="weight"
            type="number"
            placeholder="Ex: 70"
            value={weight}
            onChange={(e) => onInputChange('weight', e.target.value ? Number(e.target.value) : '')}
          />
        </div>
        
        <div>
          <Label htmlFor="height">Altura (cm) *</Label>
          <Input
            id="height"
            type="number"
            placeholder="Ex: 170"
            value={height}
            onChange={(e) => onInputChange('height', e.target.value ? Number(e.target.value) : '')}
          />
        </div>
        
        <div>
          <Label htmlFor="age">Idade (anos) *</Label>
          <Input
            id="age"
            type="number"
            placeholder="Ex: 30"
            value={age}
            onChange={(e) => onInputChange('age', e.target.value ? Number(e.target.value) : '')}
          />
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="sex">Sexo *</Label>
          <Select value={sex} onValueChange={onSexChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o sexo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="F">Feminino</SelectItem>
              <SelectItem value="M">Masculino</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="profile">Perfil Corporal</Label>
          <Select value={profile} onValueChange={onProfileChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o perfil" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="magro">Peso normal</SelectItem>
              <SelectItem value="atleta">Atleta</SelectItem>
              <SelectItem value="obeso">Sobrepeso/Obesidade</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="pt-4">
          <Button 
            onClick={onCalculate} 
            className="w-full"
            disabled={isCalculating || !weight || !height || !age}
          >
            {isCalculating ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span> Calculando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Calcular <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CalculatorForm;
