
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useConsultationData } from '@/contexts/ConsultationDataContext';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, History, TrendingUp } from 'lucide-react';
import usePatientDataLoader from '@/hooks/usePatientDataLoader';

const PatientInfoStep: React.FC = () => {
  const { 
    selectedPatient, 
    consultationData, 
    updateConsultationData, 
    setCurrentStep,
    patientHistoryData 
  } = useConsultationData();
  
  const { 
    getFormPrefilledData, 
    isLoading: dataLoading,
    hasHistoricalData,
    isFirstConsultation 
  } = usePatientDataLoader({ 
    patientId: selectedPatient?.id, 
    enabled: !!selectedPatient?.id 
  });
  
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    weight: '',
    height: '',
    age: '',
    gender: '',
    activityLevel: '',
    objective: ''
  });
  
  useEffect(() => {
    if (selectedPatient && !dataLoading) {
      const prefilledData = getFormPrefilledData();
      
      setFormData({
        weight: consultationData?.weight?.toString() || prefilledData.weight?.toString() || '',
        height: consultationData?.height?.toString() || prefilledData.height?.toString() || '',
        age: consultationData?.age?.toString() || prefilledData.age?.toString() || '',
        gender: consultationData?.gender || prefilledData.gender || 'female',
        activityLevel: consultationData?.activity_level || prefilledData.activity_level || 'moderado',
        objective: consultationData?.objective || prefilledData.objective || 'manutenção'
      });
      
      console.log('Form pre-filled with:', {
        fromConsultation: !!consultationData,
        fromHistory: hasHistoricalData,
        isFirstConsultation,
        prefilledData
      });
    }
  }, [selectedPatient, consultationData, dataLoading, getFormPrefilledData, hasHistoricalData, isFirstConsultation]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.weight || !formData.height || !formData.age) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha peso, altura e idade.",
        variant: "destructive"
      });
      return;
    }
    
    // Convert form data to appropriate types
    const updatedData = {
      weight: parseFloat(formData.weight) || 0,
      height: parseFloat(formData.height) || 0,
      age: parseInt(formData.age) || 0,
      gender: formData.gender as 'male' | 'female',
      activity_level: formData.activityLevel,
      objective: formData.objective
    };
    
    try {
      // Update consultation data with form values
      updateConsultationData(updatedData);
      
      toast({
        title: "Dados salvos",
        description: "Informações do paciente salvas com sucesso.",
      });
      
      setCurrentStep('anthropometry');
      
    } catch (error) {
      console.error('Erro no handleSubmit:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar os dados da consulta.",
        variant: "destructive"
      });
    }
  };
  
  if (!selectedPatient) return null;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Informações Básicas
          {hasHistoricalData && (
            <div className="flex items-center gap-1 text-sm text-nutri-green">
              <History className="h-4 w-4" />
              Dados históricos carregados
            </div>
          )}
        </CardTitle>
        <CardDescription>
          {isFirstConsultation 
            ? "Primeira consulta - preencha os dados básicos do paciente"
            : "Dados pré-preenchidos com informações da última consulta - confirme ou atualize"
          }
          {patientHistoryData?.lastMeasurement && (
            <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              Última medição: {new Date(patientHistoryData.lastMeasurement.date).toLocaleDateString('pt-BR')}
            </div>
          )}
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
