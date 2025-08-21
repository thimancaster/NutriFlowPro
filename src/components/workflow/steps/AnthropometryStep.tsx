
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator } from 'lucide-react';
import { useConsultationData } from '@/contexts/ConsultationDataContext';
import { usePatient } from '@/contexts/patient/PatientContext';
import { useToast } from '@/hooks/use-toast';

interface AnthropometryStepProps {
  onDataComplete: () => void;
}

export const AnthropometryStep: React.FC<AnthropometryStepProps> = ({ onDataComplete }) => {
  const { consultationData, updateConsultationData } = useConsultationData();
  const { activePatient } = usePatient();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    weight: '',
    height: '',
    age: '',
    activityLevel: 'moderado',
    objective: 'manutenção'
  });

  useEffect(() => {
    if (consultationData) {
      setFormData({
        weight: consultationData.weight?.toString() || '',
        height: consultationData.height?.toString() || '',
        age: consultationData.age?.toString() || '',
        activityLevel: consultationData.activity_level || 'moderado',
        objective: consultationData.objective || 'manutenção'
      });
    }
  }, [consultationData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveData = async () => {
    const weight = parseFloat(formData.weight);
    const height = parseFloat(formData.height);
    const age = parseInt(formData.age);

    if (!weight || !height || !age) {
      toast({
        title: "Dados incompletos",
        description: "Preencha peso, altura e idade.",
        variant: "destructive"
      });
      return;
    }

    await updateConsultationData({
      weight,
      height,
      age,
      activity_level: formData.activityLevel,
      objective: formData.objective,
      gender: activePatient?.gender || 'male'
    });

    toast({
      title: "Dados salvos",
      description: "Informações antropométricas salvas com sucesso!",
    });

    onDataComplete();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Dados Antropométricos</h2>
        <p className="text-muted-foreground">
          Colete as medidas corporais e informações básicas do paciente
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Medidas Corporais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight">Peso (kg)</Label>
              <Input
                id="weight"
                name="weight"
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={handleInputChange}
                placeholder="70.0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="height">Altura (cm)</Label>
              <Input
                id="height"
                name="height"
                type="number"
                step="0.1"
                value={formData.height}
                onChange={handleInputChange}
                placeholder="175.0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="age">Idade (anos)</Label>
              <Input
                id="age"
                name="age"
                type="number"
                value={formData.age}
                onChange={handleInputChange}
                placeholder="30"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nível de Atividade</Label>
              <Select value={formData.activityLevel} onValueChange={(value) => handleSelectChange('activityLevel', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentario">Sedentário (1.2)</SelectItem>
                  <SelectItem value="leve">Leve (1.375)</SelectItem>
                  <SelectItem value="moderado">Moderado (1.55)</SelectItem>
                  <SelectItem value="intenso">Intenso (1.725)</SelectItem>
                  <SelectItem value="muito_intenso">Muito Intenso (1.9)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Objetivo</Label>
              <Select value={formData.objective} onValueChange={(value) => handleSelectChange('objective', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="emagrecimento">Emagrecimento</SelectItem>
                  <SelectItem value="manutenção">Manutenção</SelectItem>
                  <SelectItem value="hipertrofia">Hipertrofia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="pt-4">
            <Button onClick={handleSaveData} size="lg" className="w-full">
              Salvar Dados e Prosseguir
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
