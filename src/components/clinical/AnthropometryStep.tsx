
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useConsultationData } from '@/contexts/ConsultationDataContext';
import { saveMeasurement } from '@/services/anthropometryService';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, Save, SkipForward, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const AnthropometryStep: React.FC = () => {
  const { 
    selectedPatient, 
    patientHistoryData,
    setCurrentStep,
    updateConsultationData
  } = useConsultationData();
  
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [measurements, setMeasurements] = useState({
    weight: '',
    height: '',
    waist: '',
    hip: '',
    arm: '',
    thigh: '',
    calf: '',
    chest: '',
    // Dobras cutâneas
    triceps: '',
    subscapular: '',
    suprailiac: '',
    abdominal: '',
    // Bioimpedância
    body_fat_pct: '',
    lean_mass_kg: '',
    muscle_mass_percentage: '',
    water_percentage: ''
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Pré-preenchimento com dados históricos
  useEffect(() => {
    if (patientHistoryData?.lastMeasurement) {
      const lastMeasurement = patientHistoryData.lastMeasurement;
      setMeasurements(prev => ({
        ...prev,
        weight: lastMeasurement.weight?.toString() || '',
        height: lastMeasurement.height?.toString() || '',
        waist: lastMeasurement.waist?.toString() || '',
        hip: lastMeasurement.hip?.toString() || '',
        arm: lastMeasurement.arm?.toString() || '',
        thigh: lastMeasurement.thigh?.toString() || '',
        calf: lastMeasurement.calf?.toString() || '',
        chest: lastMeasurement.chest?.toString() || '',
        triceps: lastMeasurement.triceps?.toString() || '',
        subscapular: lastMeasurement.subscapular?.toString() || '',
        suprailiac: lastMeasurement.suprailiac?.toString() || '',
        abdominal: lastMeasurement.abdominal?.toString() || '',
        body_fat_pct: lastMeasurement.body_fat_pct?.toString() || '',
        lean_mass_kg: lastMeasurement.lean_mass_kg?.toString() || '',
        muscle_mass_percentage: lastMeasurement.muscle_mass_percentage?.toString() || '',
        water_percentage: lastMeasurement.water_percentage?.toString() || ''
      }));
    }
  }, [patientHistoryData?.lastMeasurement]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMeasurements(prev => ({ ...prev, [name]: value }));
    setHasChanges(true);
  };
  
  const calculateIMC = () => {
    const weight = parseFloat(measurements.weight);
    const height = parseFloat(measurements.height);
    if (weight && height) {
      return (weight / Math.pow(height / 100, 2)).toFixed(2);
    }
    return '';
  };
  
  const calculateRCQ = () => {
    const waist = parseFloat(measurements.waist);
    const hip = parseFloat(measurements.hip);
    if (waist && hip) {
      return (waist / hip).toFixed(2);
    }
    return '';
  };
  
  const handleSaveMeasurements = async () => {
    if (!selectedPatient || !user) {
      toast({
        title: "Erro",
        description: "Paciente ou usuário não encontrado.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Preparar dados de medição apenas com campos preenchidos
      const measurementData: any = {
        patient_id: selectedPatient.id,
        date: new Date().toISOString(),
      };
      
      // Adicionar apenas campos com valores
      Object.entries(measurements).forEach(([key, value]) => {
        if (value && value.trim() !== '') {
          const numValue = parseFloat(value);
          if (!isNaN(numValue)) {
            measurementData[key] = numValue;
          }
        }
      });
      
      // Calcular métricas se dados básicos estiverem disponíveis
      if (measurementData.weight && measurementData.height) {
        measurementData.imc = parseFloat(calculateIMC());
        
        // Atualizar dados da consulta com peso e altura
        updateConsultationData({
          weight: measurementData.weight,
          height: measurementData.height
        });
      }
      
      if (measurementData.waist && measurementData.hip) {
        measurementData.rcq = parseFloat(calculateRCQ());
      }
      
      // Salvar apenas se houver dados relevantes
      if (Object.keys(measurementData).length > 2) {
        const result = await saveMeasurement(measurementData, user.id);
        
        if (result.success) {
          toast({
            title: "Sucesso",
            description: "Medições antropométricas salvas com sucesso.",
          });
          setHasChanges(false);
        } else {
          throw new Error(result.error || 'Failed to save measurements');
        }
      }
    } catch (error) {
      console.error('Error saving measurements:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as medições.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleContinue = async () => {
    if (hasChanges) {
      await handleSaveMeasurements();
    }
    setCurrentStep('nutritional-evaluation');
  };
  
  const handleSkip = () => {
    setCurrentStep('nutritional-evaluation');
  };
  
  const handleBack = () => {
    setCurrentStep('patient-info');
  };
  
  if (!selectedPatient) return null;
  
  const hasHistoricalData = patientHistoryData?.anthropometryHistory && patientHistoryData.anthropometryHistory.length > 0;
  const lastMeasurementDate = patientHistoryData?.lastMeasurement?.date 
    ? new Date(patientHistoryData.lastMeasurement.date).toLocaleDateString('pt-BR')
    : null;
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Antropometria
              <Badge variant="secondary" className="text-xs">Opcional</Badge>
            </CardTitle>
            <CardDescription>
              {hasHistoricalData 
                ? `Dados pré-preenchidos com última medição (${lastMeasurementDate}). Atualize conforme necessário.`
                : "Registre as medidas antropométricas do paciente (opcional)."
              }
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            onClick={handleSkip}
            className="text-muted-foreground hover:text-foreground"
          >
            <SkipForward className="mr-2 h-4 w-4" />
            Pular Etapa
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Medidas Básicas */}
        <div>
          <h3 className="text-lg font-medium mb-3">Medidas Básicas</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight">Peso (kg)</Label>
              <Input
                id="weight"
                name="weight"
                type="number"
                step="0.1"
                value={measurements.weight}
                onChange={handleInputChange}
                placeholder="Ex: 70.5"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="height">Altura (cm)</Label>
              <Input
                id="height"
                name="height"
                type="number"
                step="0.1"
                value={measurements.height}
                onChange={handleInputChange}
                placeholder="Ex: 170"
              />
            </div>
            
            <div className="space-y-2">
              <Label>IMC</Label>
              <div className="flex items-center h-10 px-3 py-2 border border-gray-200 rounded-md bg-gray-50">
                <span className="text-sm text-muted-foreground">{calculateIMC() || '--'}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Circunferências */}
        <div>
          <h3 className="text-lg font-medium mb-3">Circunferências (cm)</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="waist">Cintura</Label>
              <Input
                id="waist"
                name="waist"
                type="number"
                step="0.1"
                value={measurements.waist}
                onChange={handleInputChange}
                placeholder="Ex: 80"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="hip">Quadril</Label>
              <Input
                id="hip"
                name="hip"
                type="number"
                step="0.1"
                value={measurements.hip}
                onChange={handleInputChange}
                placeholder="Ex: 95"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="arm">Braço</Label>
              <Input
                id="arm"
                name="arm"
                type="number"
                step="0.1"
                value={measurements.arm}
                onChange={handleInputChange}
                placeholder="Ex: 25"
              />
            </div>
            
            <div className="space-y-2">
              <Label>RCQ</Label>
              <div className="flex items-center h-10 px-3 py-2 border border-gray-200 rounded-md bg-gray-50">
                <span className="text-sm text-muted-foreground">{calculateRCQ() || '--'}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="thigh">Coxa</Label>
              <Input
                id="thigh"
                name="thigh"
                type="number"
                step="0.1"
                value={measurements.thigh}
                onChange={handleInputChange}
                placeholder="Ex: 45"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="calf">Panturrilha</Label>
              <Input
                id="calf"
                name="calf"
                type="number"
                step="0.1"
                value={measurements.calf}
                onChange={handleInputChange}
                placeholder="Ex: 35"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="chest">Tórax</Label>
              <Input
                id="chest"
                name="chest"
                type="number"
                step="0.1"
                value={measurements.chest}
                onChange={handleInputChange}
                placeholder="Ex: 90"
              />
            </div>
          </div>
        </div>
        
        {/* Dobras Cutâneas */}
        <div>
          <h3 className="text-lg font-medium mb-3">Dobras Cutâneas (mm)</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="triceps">Tríceps</Label>
              <Input
                id="triceps"
                name="triceps"
                type="number"
                step="0.1"
                value={measurements.triceps}
                onChange={handleInputChange}
                placeholder="Ex: 15"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subscapular">Subescapular</Label>
              <Input
                id="subscapular"
                name="subscapular"
                type="number"
                step="0.1"
                value={measurements.subscapular}
                onChange={handleInputChange}
                placeholder="Ex: 12"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="suprailiac">Supra-ilíaca</Label>
              <Input
                id="suprailiac"
                name="suprailiac"
                type="number"
                step="0.1"
                value={measurements.suprailiac}
                onChange={handleInputChange}
                placeholder="Ex: 18"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="abdominal">Abdominal</Label>
              <Input
                id="abdominal"
                name="abdominal"
                type="number"
                step="0.1"
                value={measurements.abdominal}
                onChange={handleInputChange}
                placeholder="Ex: 20"
              />
            </div>
          </div>
        </div>
        
        {/* Bioimpedância */}
        <div>
          <h3 className="text-lg font-medium mb-3">Bioimpedância</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="body_fat_pct">% Gordura</Label>
              <Input
                id="body_fat_pct"
                name="body_fat_pct"
                type="number"
                step="0.1"
                value={measurements.body_fat_pct}
                onChange={handleInputChange}
                placeholder="Ex: 15.5"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lean_mass_kg">Massa Magra (kg)</Label>
              <Input
                id="lean_mass_kg"
                name="lean_mass_kg"
                type="number"
                step="0.1"
                value={measurements.lean_mass_kg}
                onChange={handleInputChange}
                placeholder="Ex: 55.2"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="muscle_mass_percentage">% Músculo</Label>
              <Input
                id="muscle_mass_percentage"
                name="muscle_mass_percentage"
                type="number"
                step="0.1"
                value={measurements.muscle_mass_percentage}
                onChange={handleInputChange}
                placeholder="Ex: 42.5"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="water_percentage">% Água</Label>
              <Input
                id="water_percentage"
                name="water_percentage"
                type="number"
                step="0.1"
                value={measurements.water_percentage}
                onChange={handleInputChange}
                placeholder="Ex: 60.0"
              />
            </div>
          </div>
        </div>

        {hasChanges && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-amber-800">
              <Activity className="h-4 w-4" />
              <span className="text-sm font-medium">Alterações não salvas</span>
            </div>
            <p className="text-sm text-amber-700 mt-1">
              Você fez alterações nas medições. Clique em "Salvar" para preservar os dados.
            </p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        
        <div className="flex gap-2">
          {hasChanges && (
            <Button 
              variant="outline" 
              onClick={handleSaveMeasurements}
              disabled={isSaving}
            >
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
          )}
          
          <Button onClick={handleContinue} disabled={isSaving}>
            Continuar
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default AnthropometryStep;
