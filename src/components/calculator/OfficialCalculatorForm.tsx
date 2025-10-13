import { useEffect } from 'react';
import { useOfficialCalculations } from '@/hooks/useOfficialCalculations';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ResultsDisplay } from '../components/ResultsDisplay';
import { usePatient } from '@/contexts/patient/PatientContext';

export const OfficialCalculatorForm = () => {
  const {
    inputs,
    results,
    loading,
    updateInputs,
    updateMacroInputs,
    calculate,
  } = useOfficialCalculations();

  const { activePatient } = usePatient();

  useEffect(() => {
    if (activePatient) {
      updateInputs({
        weight: activePatient.weight || undefined,
        height: activePatient.height || undefined,
        age: activePatient.age || undefined,
        gender: activePatient.gender || 'F',
      });
    }
  }, [activePatient, updateInputs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await calculate();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dados Antropométricos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="weight">Peso (kg)</Label>
              <Input
                id="weight"
                type="number"
                value={inputs.weight || ''}
                onChange={(e) =>
                  updateInputs({ weight: Number(e.target.value) })
                }
                placeholder="Ex: 70"
              />
            </div>
            <div>
              <Label htmlFor="height">Altura (cm)</Label>
              <Input
                id="height"
                type="number"
                value={inputs.height || ''}
                onChange={(e) =>
                  updateInputs({ height: Number(e.target.value) })
                }
                placeholder="Ex: 175"
              />
            </div>
            <div>
              <Label htmlFor="age">Idade</Label>
              <Input
                id="age"
                type="number"
                value={inputs.age || ''}
                onChange={(e) => updateInputs({ age: Number(e.target.value) })}
                placeholder="Ex: 30"
              />
            </div>
            <div>
              <Label htmlFor="gender">Sexo</Label>
              <Select
                value={inputs.gender}
                onValueChange={(value) =>
                  updateInputs({ gender: value as 'M' | 'F' })
                }
              >
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">Masculino</SelectItem>
                  <SelectItem value="F">Feminino</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Perfil e Nível de Atividade</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <Label htmlFor="profile">Perfil do Paciente</Label>
              <Select
                value={inputs.profile}
                onValueChange={(value) =>
                  updateInputs({
                    profile: value as
                      | 'eutrofico'
                      | 'sobrepeso_obesidade'
                      | 'atleta',
                  })
                }
              >
                <SelectTrigger id="profile">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="eutrofico">
                    Eutrófico (Magro)
                  </SelectItem>
                  <SelectItem value="sobrepeso_obesidade">
                    Sobrepeso/Obesidade
                  </SelectItem>
                  <SelectItem value="atleta">Atleta/Musculoso</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="activityLevel">Nível de Atividade</Label>
              <Select
                value={inputs.activityLevel}
                onValueChange={(value) =>
                  updateInputs({
                    activityLevel: value as
                      | 'sedentario'
                      | 'leve'
                      | 'moderado'
                      | 'intenso'
                      | 'muito_intenso',
                  })
                }
              >
                <SelectTrigger id="activityLevel">
                  <SelectValue placeholder="Selecione..." />
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
            {/* CÓDIGO ADICIONADO ABAIXO */}
            <div>
              <Label htmlFor="manualActivityFactor">F.A. Manual</Label>
              <Input
                id="manualActivityFactor"
                type="number"
                step="0.01"
                value={inputs.manualActivityFactor || ''}
                onChange={(e) =>
                  updateInputs({
                    manualActivityFactor: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
                placeholder="Ex: 1.55 (Opcional)"
              />
            </div>
            {/* FIM DO CÓDIGO ADICIONADO */}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Objetivo e Macronutrientes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="objective">Objetivo Calórico</Label>
              <Select
                value={inputs.objective}
                onValueChange={(value) =>
                  updateInputs({
                    objective: value as
                      | 'emagrecimento'
                      | 'manutencao'
                      | 'hipertrofia'
                      | 'personalizado',
                  })
                }
              >
                <SelectTrigger id="objective">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="emagrecimento">Emagrecimento</SelectItem>
                  <SelectItem value="manutencao">Manutenção</SelectItem>
                  <SelectItem value="hipertrofia">Hipertrofia</SelectItem>
                  <SelectItem value="personalizado">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {inputs.objective === 'personalizado' && (
              <div>
                <Label htmlFor="customAdjustment">Ajuste Kcal</Label>
                <Input
                  id="customAdjustment"
                  type="number"
                  value={inputs.customAdjustment || ''}
                  onChange={(e) =>
                    updateInputs({
                      customAdjustment: Number(e.target.value),
                    })
                  }
                  placeholder="Ex: -500 ou 300"
                />
              </div>
            )}
            <div>
              <Label htmlFor="proteinPerKg">Proteína (g/kg)</Label>
              <Input
                id="proteinPerKg"
                type="number"
                step="0.1"
                value={inputs.macroInputs?.proteinPerKg || ''}
                onChange={(e) =>
                  updateMacroInputs({
                    ...inputs.macroInputs,
                    proteinPerKg: Number(e.target.value),
                  })
                }
                placeholder="Ex: 1.8"
              />
            </div>
            <div>
              <Label htmlFor="fatPerKg">Gordura (g/kg)</Label>
              <Input
                id="fatPerKg"
                type="number"
                step="0.1"
                value={inputs.macroInputs?.fatPerKg || ''}
                onChange={(e) =>
                  updateMacroInputs({
                    ...inputs.macroInputs,
                    fatPerKg: Number(e.target.value),
                  })
                }
                placeholder="Ex: 0.8"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {results && <ResultsDisplay results={results} />}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Calculando...' : 'Calcular'}
      </Button>
    </form>
  );
};
