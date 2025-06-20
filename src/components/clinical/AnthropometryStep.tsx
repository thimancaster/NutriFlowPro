
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useClinical } from '@/contexts/ClinicalContext';
import { saveMeasurement } from '@/services/anthropometryService';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, Save } from 'lucide-react';

const AnthropometryStep: React.FC = () => {
  const { activePatient, activeConsultation, saveConsultationData, setCurrentStep } = useClinical();
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
  
  useEffect(() => {
    if (activeConsultation) {
      setMeasurements(prev => ({
        ...prev,
        weight: activeConsultation.weight?.toString() || '',
        height: activeConsultation.height?.toString() || ''
      }));
    }
  }, [activeConsultation]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMeasurements(prev => ({ ...prev, [name]: value }));
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
    if (!activePatient || !user) {
      toast({
        title: "Erro",
        description: "Paciente ou usuário não encontrado.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Prepare measurement data
      const measurementData = {
        patient_id: activePatient.id,
        date: new Date().toISOString(),
        weight: parseFloat(measurements.weight) || undefined,
        height: parseFloat(measurements.height) || undefined,
        imc: calculateIMC() ? parseFloat(calculateIMC()) : undefined,
        waist: parseFloat(measurements.waist) || undefined,
        hip: parseFloat(measurements.hip) || undefined,
        arm: parseFloat(measurements.arm) || undefined,
        thigh: parseFloat(measurements.thigh) || undefined,
        calf: parseFloat(measurements.calf) || undefined,
        chest: parseFloat(measurements.chest) || undefined,
        triceps: parseFloat(measurements.triceps) || undefined,
        subscapular: parseFloat(measurements.subscapular) || undefined,
        suprailiac: parseFloat(measurements.suprailiac) || undefined,
        abdominal: parseFloat(measurements.abdominal) || undefined,
        body_fat_pct: parseFloat(measurements.body_fat_pct) || undefined,
        lean_mass_kg: parseFloat(measurements.lean_mass_kg) || undefined,
        muscle_mass_percentage: parseFloat(measurements.muscle_mass_percentage) || undefined,
        water_percentage: parseFloat(measurements.water_percentage) || undefined,
        rcq: calculateRCQ() ? parseFloat(calculateRCQ()) : undefined
      };
      
      // Save to anthropometry table
      const result = await saveMeasurement(measurementData, user.id);
      
      if (result.success) {
        // Also update consultation data
        await saveConsultationData({
          weight: parseFloat(measurements.weight) || 0,
          height: parseFloat(measurements.height) || 0
        });
        
        toast({
          title: "Sucesso",
          description: "Medições salvas com sucesso.",
        });
      } else {
        throw new Error(result.error || 'Failed to save measurements');
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
    await handleSaveMeasurements();
    setCurrentStep('results');
  };
  
  const handleBack = () => {
    setCurrentStep('patient-info');
  };
  
  if (!activePatient) return null;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Antropometria</CardTitle>
        <CardDescription>
          Registre as medidas antropométricas do paciente
        </CardDescription>
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
                <span className="text-sm">{calculateIMC() || '--'}</span>
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
              />
            </div>
            
            <div className="space-y-2">
              <Label>RCQ</Label>
              <div className="flex items-center h-10 px-3 py-2 border border-gray-200 rounded-md bg-gray-50">
                <span className="text-sm">{calculateRCQ() || '--'}</span>
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
              />
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleSaveMeasurements}
            disabled={isSaving}
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Salvando...' : 'Salvar Medições'}
          </Button>
          
          <Button onClick={handleContinue} disabled={isSaving}>
            Avançar
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default AnthropometryStep;
