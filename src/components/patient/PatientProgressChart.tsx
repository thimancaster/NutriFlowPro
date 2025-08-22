
import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConsultationService } from '@/services/consultationService';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface PatientProgressChartProps {
  patientId: string;
}

const PatientProgressChart: React.FC<PatientProgressChartProps> = ({ patientId }) => {
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEvolutionData = async () => {
      console.log('[ATTEND:E2E] Loading patient evolution chart');
      
      try {
        const result = await ConsultationService.getEvolutionData(patientId);
        
        if (result.success && result.data) {
          const data = result.data;
          
          const chartConfig = {
            labels: data.map(item => new Date(item.date).toLocaleDateString('pt-BR')),
            datasets: [
              {
                label: 'Peso (kg)',
                data: data.map(item => item.weight),
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.1,
              },
              {
                label: 'IMC',
                data: data.map(item => item.bmi || 0),
                borderColor: 'rgb(34, 197, 94)',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                tension: 0.1,
                yAxisID: 'y1',
              },
            ],
          };
          
          setChartData(chartConfig);
        }
      } catch (error) {
        console.error('[ATTEND:E2E] Error loading evolution data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      loadEvolutionData();
    }
  }, [patientId]);

  const options = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Peso (kg)',
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'IMC',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Evolução do Paciente',
      },
    },
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gráfico de Evolução</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Carregando dados...</p>
        </CardContent>
      </Card>
    );
  }

  if (!chartData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gráfico de Evolução</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Nenhum dado de evolução disponível.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gráfico de Evolução</CardTitle>
      </CardHeader>
      <CardContent>
        <Line data={chartData} options={options} />
      </CardContent>
    </Card>
  );
};

export default PatientProgressChart;
