
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Tables } from '@/integrations/supabase/types';
import MeasurementsInputGrid from './MeasurementsInputGrid';
import MetricsDisplay from './MetricsDisplay';
import PatientHeader from './PatientHeader';

interface AnthropometryFormProps {
  patientId: string;
  patientName?: string;
  patientAge?: number;
  patientGender?: string;
}

type AnthropometryInsertType = Partial<Tables<"anthropometry">> & {
  user_id?: string;
  patient_id: string;
  date?: string;
  weight: number | null;
  height: number | null;
};

const AnthropometryForm: React.FC<AnthropometryFormProps> = ({
  patientId,
  patientName = "",
  patientAge = 30,
  patientGender = "female"
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [form, setForm] = useState<AnthropometryInsertType>({
    patient_id: patientId,
    weight: null,
    height: null,
    triceps: null,
    subscapular: null,
    suprailiac: null,
    abdominal: null,
    thigh: null,
    chest: null,
    waist: null,
    hip: null,
    arm: null,
    calf: null
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value === '' ? null : parseFloat(value) }));
  };

  const calculateMetrics = () => {
    if (!form.weight || !form.height || !form.waist || !form.hip) {
      return { imc: null, rcq: null, bodyFatPct: null, leanMassKg: null };
    }
    
    const height = form.height / 100; // Convert to meters
    const sumFolds = (form.triceps || 0) + (form.subscapular || 0) + (form.suprailiac || 0) + 
                     (form.abdominal || 0) + (form.thigh || 0) + (form.chest || 0);
    
    const imc = form.weight / (height * height);
    const rcq = form.waist / form.hip;
    
    const bodyFatPct = sumFolds > 0
      ? patientGender === 'male'
        ? 0.29288 * sumFolds - 0.0005 * Math.pow(sumFolds, 2) + 0.15845 * patientAge - 5.76377
        : 0.29669 * sumFolds - 0.00043 * Math.pow(sumFolds, 2) + 0.02963 * patientAge + 1.4072
      : null;
    
    const leanMassKg = bodyFatPct !== null 
      ? form.weight * (1 - bodyFatPct / 100)
      : null;
    
    return { 
      imc: parseFloat(imc.toFixed(2)), 
      rcq: parseFloat(rcq.toFixed(2)), 
      bodyFatPct: bodyFatPct !== null ? parseFloat(bodyFatPct.toFixed(2)) : null, 
      leanMassKg: leanMassKg !== null ? parseFloat(leanMassKg.toFixed(2)) : null
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
        <PatientHeader patientName={patientName} />
        <MeasurementsInputGrid
          fields={measurementFields}
          values={form}
          onChange={handleChange}
        />
        <MetricsDisplay metrics={metrics} />
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
