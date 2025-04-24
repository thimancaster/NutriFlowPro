
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface AnthropometryFormProps {
  patientId: string;
  patientName?: string;
  patientAge?: number;
  patientGender?: string;
}

const AnthropometryForm: React.FC<AnthropometryFormProps> = ({ 
  patientId, 
  patientName = "", 
  patientAge = 30, 
  patientGender = "female" 
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [form, setForm] = useState({
    weight: '',
    height: '',
    triceps: '',
    subscapular: '',
    suprailiac: '',
    abdominal: '',
    thigh: '',
    chest: '',
    waist: '',
    hip: '',
    arm: '',
    calf: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value === '' ? '' : parseFloat(value) }));
  };

  const calculateMetrics = () => {
    if (!form.weight || !form.height || !form.waist || !form.hip) {
      return { imc: 0, rcq: 0, bodyFatPct: 0, leanMassKg: 0 };
    }
    
    const height = parseFloat(form.height as string) / 100; // Convert to meters
    const weight = parseFloat(form.weight as string);
    const waist = parseFloat(form.waist as string);
    const hip = parseFloat(form.hip as string);
    
    const imc = weight / (height * height);
    const rcq = waist / hip;
    
    // Calculate body fat percentage based on available skinfolds
    let sumFolds = 0;
    let validFolds = 0;
    
    ['triceps', 'subscapular', 'suprailiac', 'abdominal', 'thigh', 'chest'].forEach(fold => {
      const value = parseFloat(form[fold as keyof typeof form] as string);
      if (!isNaN(value)) {
        sumFolds += value;
        validFolds++;
      }
    });
    
    // Simplified formula (example) - would normally use gender-specific formulas
    const bodyFatPct = validFolds >= 3
      ? patientGender === 'male'
        ? 0.29288 * sumFolds - 0.0005 * Math.pow(sumFolds, 2) + 0.15845 * patientAge - 5.76377
        : 0.29669 * sumFolds - 0.00043 * Math.pow(sumFolds, 2) + 0.02963 * patientAge + 1.4072
      : 0;
    
    const leanMassKg = weight * (1 - bodyFatPct / 100);
    
    return { 
      imc: parseFloat(imc.toFixed(2)), 
      rcq: parseFloat(rcq.toFixed(2)), 
      bodyFatPct: parseFloat(bodyFatPct.toFixed(2)), 
      leanMassKg: parseFloat(leanMassKg.toFixed(2))
    };
  };

  const handleSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro de autenticação",
          description: "Você precisa estar logado para salvar uma avaliação.",
          variant: "destructive"
        });
        return;
      }
      
      const { imc, rcq, bodyFatPct, leanMassKg } = calculateMetrics();
      
      const { error } = await supabase.from('anthropometry').insert({
        user_id: user.id,
        patient_id: patientId,
        date: new Date().toISOString(),
        ...form,
        imc,
        rcq,
        body_fat_pct: bodyFatPct,
        lean_mass_kg: leanMassKg
      });
      
      if (error) {
        console.error("Error saving anthropometry:", error);
        toast({
          title: "Erro ao salvar",
          description: error.message,
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "Avaliação salva",
        description: "A avaliação antropométrica foi salva com sucesso."
      });
      
      navigate(`/patient-history/${patientId}`);
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar a avaliação.",
        variant: "destructive"
      });
    }
  };

  const measurementFields = [
    { name: 'weight', label: 'Peso (kg)' },
    { name: 'height', label: 'Altura (cm)' },
    { name: 'waist', label: 'Cintura (cm)' },
    { name: 'hip', label: 'Quadril (cm)' },
    { name: 'triceps', label: 'Tríceps (mm)' },
    { name: 'subscapular', label: 'Subescapular (mm)' },
    { name: 'suprailiac', label: 'Suprailíaca (mm)' },
    { name: 'abdominal', label: 'Abdominal (mm)' },
    { name: 'thigh', label: 'Coxa (mm)' },
    { name: 'chest', label: 'Peitoral (mm)' },
    { name: 'arm', label: 'Braço (cm)' },
    { name: 'calf', label: 'Panturrilha (cm)' }
  ];

  const metrics = calculateMetrics();

  return (
    <Card className="border-none shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle>Nova Avaliação Antropométrica</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          {patientName && (
            <p className="text-lg font-medium">Paciente: <span className="text-nutri-blue">{patientName}</span></p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {measurementFields.map((field) => (
            <div key={field.name} className="flex flex-col">
              <label htmlFor={field.name} className="text-sm font-medium mb-1">
                {field.label}
              </label>
              <Input
                id={field.name}
                name={field.name}
                type="number"
                step="any"
                value={form[field.name as keyof typeof form] || ''}
                onChange={handleChange}
                placeholder={`Digite o ${field.label.toLowerCase()}`}
                className="mb-4"
              />
            </div>
          ))}
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="font-medium mb-3">Resultados Calculados</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-white rounded-md shadow-sm">
              <p className="text-sm text-gray-500">IMC</p>
              <p className="font-bold text-lg">{metrics.imc || '-'}</p>
            </div>
            <div className="p-3 bg-white rounded-md shadow-sm">
              <p className="text-sm text-gray-500">RCQ</p>
              <p className="font-bold text-lg">{metrics.rcq || '-'}</p>
            </div>
            <div className="p-3 bg-white rounded-md shadow-sm">
              <p className="text-sm text-gray-500">% Gordura</p>
              <p className="font-bold text-lg">{metrics.bodyFatPct || '-'}%</p>
            </div>
            <div className="p-3 bg-white rounded-md shadow-sm">
              <p className="text-sm text-gray-500">Massa Magra</p>
              <p className="font-bold text-lg">{metrics.leanMassKg || '-'} kg</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSubmit} className="bg-nutri-green hover:bg-nutri-green-dark">
            Salvar Avaliação
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnthropometryForm;
