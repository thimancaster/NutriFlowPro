
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { PlusCircle, ChevronDown } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface PatientEvolutionProps {
  patientId: string;
}

interface AnthropometryMeasurement {
  id: string;
  date: string;
  weight?: number;
  height?: number;
  waist?: number;
  hip?: number;
  body_fat_pct?: number;
  imc?: number;
}

const PatientEvolution = ({ patientId }: PatientEvolutionProps) => {
  const [measurements, setMeasurements] = useState<AnthropometryMeasurement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchMeasurements = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('anthropometry')
          .select('id, date, weight, height, waist, hip, body_fat_pct, imc')
          .eq('patient_id', patientId)
          .order('date', { ascending: false });
        
        if (error) throw error;
        setMeasurements(data || []);
      } catch (error) {
        console.error('Error fetching anthropometry data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMeasurements();
  }, [patientId]);
  
  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'dd/MM/yyyy');
    } catch (e) {
      return dateStr;
    }
  };
  
  const handleNewMeasurement = () => {
    navigate(`/patient-anthropometry/${patientId}`);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nutri-blue"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Evolução Antropométrica</h3>
        <Button 
          onClick={handleNewMeasurement}
          className="bg-nutri-blue hover:bg-blue-700"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Nova Avaliação
        </Button>
      </div>
      
      {measurements.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Data</th>
                <th className="text-left p-2">Peso (kg)</th>
                <th className="text-left p-2">Altura (cm)</th>
                <th className="text-left p-2">IMC</th>
                <th className="text-left p-2">Cintura (cm)</th>
                <th className="text-left p-2">Quadril (cm)</th>
                <th className="text-left p-2">Gordura (%)</th>
              </tr>
            </thead>
            <tbody>
              {measurements.map((measurement) => (
                <tr key={measurement.id} className="border-b hover:bg-gray-50">
                  <td className="p-2">{formatDate(measurement.date)}</td>
                  <td className="p-2">{measurement.weight?.toFixed(1) || '-'}</td>
                  <td className="p-2">{measurement.height?.toFixed(1) || '-'}</td>
                  <td className="p-2">{measurement.imc?.toFixed(1) || '-'}</td>
                  <td className="p-2">{measurement.waist?.toFixed(1) || '-'}</td>
                  <td className="p-2">{measurement.hip?.toFixed(1) || '-'}</td>
                  <td className="p-2">{measurement.body_fat_pct?.toFixed(1) || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500 italic">Nenhuma avaliação antropométrica registrada.</p>
      )}
      
      {/* For future implementation - we'll add charts here */}
      <div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-blue-800">Os gráficos de evolução serão implementados em breve.</p>
        </div>
      </div>
    </div>
  );
};

export default PatientEvolution;
