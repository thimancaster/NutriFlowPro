
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useClinical } from '@/contexts/ClinicalContext';
import { ArrowRight } from 'lucide-react';

const PatientInfoStep: React.FC = () => {
  const { activePatient, activeConsultation, saveConsultationData, setCurrentStep } = useClinical();
  const [formData, setFormData] = useState({
    weight: '',
    height: '',
    age: '',
    gender: '',
    activityLevel: '',
    objective: ''
  });
  
  useEffect(() => {
    if (activePatient && activeConsultation) {
      setFormData({
        weight: activeConsultation.weight?.toString() || activePatient.measurements?.weight?.toString() || '',
        height: activeConsultation.height?.toString() || activePatient.measurements?.height?.toString() || '',
        age: activeConsultation.age?.toString() || activePatient.age?.toString() || '',
        gender: activeConsultation.gender || activePatient.gender || 'female',
        activityLevel: activeConsultation.activity_level || 'moderado',
        objective: activeConsultation.objective || activePatient.goals?.objective || 'manutenção'
      });
    }
  }, [activePatient, activeConsultation]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert form data to appropriate types
    const updatedData = {
      weight: parseFloat(formData.weight) || 0,
      height: parseFloat(formData.height) || 0,
      age: parseInt(formData.age) || 0,
      gender: formData.gender,
      activity_level: formData.activityLevel,
      objective: formData.objective
    };
    
    const success = await saveConsultationData(updatedData);
    
    if (success) {
      setCurrentStep('anthropometry');
    }
  };
  
  if (!activePatient) return null;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações Básicas</CardTitle>
        <CardDescription>
          Confirme ou atualize os dados básicos do paciente para esta consulta
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight">Peso atual (kg)</Label>
              <Input
                id="weight"
                name="weight"
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={handleInputChange}
                placeholder="Ex: 70.5"
                required
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
                placeholder="Ex: 170"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="age">Idade</Label>
              <Input
                id="age"
                name="age"
                type="number"
                value={formData.age}
                onChange={handleInputChange}
                placeholder="Ex: 35"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gender">Sexo</Label>
              <Select 
                value={formData.gender} 
                onValueChange={(value) => handleSelectChange('gender', value)}
              >
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Selecione o sexo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="female">Feminino</SelectItem>
                  <SelectItem value="male">Masculino</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="activityLevel">Nível de Atividade Física</Label>
              <Select 
                value={formData.activityLevel} 
                onValueChange={(value) => handleSelectChange('activityLevel', value)}
              >
                <SelectTrigger id="activityLevel">
                  <SelectValue placeholder="Selecione o nível de atividade" />
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
            
            <div className="space-y-2">
              <Label htmlFor="objective">Objetivo</Label>
              <Select 
                value={formData.objective} 
                onValueChange={(value) => handleSelectChange('objective', value)}
              >
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
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" className="bg-nutri-green hover:bg-nutri-green-dark">
            Avançar
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default PatientInfoStep;
