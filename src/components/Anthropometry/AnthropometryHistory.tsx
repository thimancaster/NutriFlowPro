import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { Tables } from '@/integrations/supabase/types';

type AnthropometryData = Tables<'anthropometry'>['Row'];

const AnthropometryHistory: React.FC<{ patientId: string }> = ({ patientId }) => {
  const [measurements, setMeasurements] = useState<AnthropometryData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAnthropometryData = async () => {
      try {
        const { data, error } = await supabase
          .from('anthropometry')
          .select('*')
          .eq('patient_id', patientId)
          .order('date', { ascending: true });

        if (error) {
          throw error;
        }

        setMeasurements(data || []);
      } catch (error) {
        console.error('Error fetching anthropometry data:', error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar o histórico antropométrico.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      fetchAnthropometryData();
    }
  }, [patientId, toast]);

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'dd/MM/yy');
    } catch (e) {
      return dateStr;
    }
  };

  const chartData = measurements.map(item => ({
    ...item,
    date: formatDate(item.date),
  }));

  const calculateChange = (metric: keyof AnthropometryData) => {
    if (measurements.length < 2) return null;
    
    const latest = measurements[measurements.length - 1][metric];
    const previous = measurements[measurements.length - 2][metric];
    
    if (typeof latest !== 'number' || typeof previous !== 'number') return null;
    
    const change = latest - previous;
    const percentChange = (change / previous) * 100;
    
    return {
      value: change.toFixed(2),
      percent: percentChange.toFixed(2),
      increased: change > 0
    };
  };

  const weightChange = calculateChange('weight');
  const bodyFatChange = calculateChange('body_fat_pct');
  const imcChange = calculateChange('imc');

  return (
    <Card className="border-none shadow-lg">
      <CardHeader>
        <CardTitle>Histórico Antropométrico</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Carregando dados...</p>
        ) : measurements.length === 0 ? (
          <p>Nenhuma medida antropométrica registrada ainda.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-500">Peso Atual</p>
                <p className="text-2xl font-bold">{measurements[measurements.length - 1].weight} kg</p>
                {weightChange && (
                  <div className={`text-sm ${weightChange.increased ? 'text-red-500' : 'text-green-500'}`}>
                    {weightChange.increased ? '↑' : '↓'} {weightChange.value} kg ({weightChange.percent}%)
                  </div>
                )}
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-500">% Gordura Atual</p>
                <p className="text-2xl font-bold">{measurements[measurements.length - 1].body_fat_pct}%</p>
                {bodyFatChange && (
                  <div className={`text-sm ${bodyFatChange.increased ? 'text-red-500' : 'text-green-500'}`}>
                    {bodyFatChange.increased ? '↑' : '↓'} {bodyFatChange.value}% ({bodyFatChange.percent}%)
                  </div>
                )}
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-500">IMC Atual</p>
                <p className="text-2xl font-bold">{measurements[measurements.length - 1].imc}</p>
                {imcChange && (
                  <div className={`text-sm ${imcChange.increased ? 'text-red-500' : 'text-green-500'}`}>
                    {imcChange.increased ? '↑' : '↓'} {imcChange.value} ({imcChange.percent}%)
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="font-medium mb-4">Evolução do Peso e Composição Corporal</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="weight" stroke="#8884d8" name="Peso (kg)" />
                      <Line type="monotone" dataKey="body_fat_pct" stroke="#82ca9d" name="% Gordura" />
                      <Line type="monotone" dataKey="lean_mass_kg" stroke="#ffc658" name="Massa Magra (kg)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="font-medium mb-4">Evolução do IMC e RCQ</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="imc" stroke="#8884d8" name="IMC" />
                      <Line type="monotone" dataKey="rcq" stroke="#82ca9d" name="RCQ" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AnthropometryHistory;
