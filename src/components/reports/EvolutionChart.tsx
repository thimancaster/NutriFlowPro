/**
 * EVOLUTION CHART COMPONENT
 * Displays line charts for metric evolution over time
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { CalculationHistoryRecord } from '@/services/reportsService';

interface EvolutionChartProps {
  data: CalculationHistoryRecord[];
  title: string;
  metrics: {
    key: keyof CalculationHistoryRecord;
    name: string;
    color: string;
    unit?: string;
  }[];
}

const EvolutionChart: React.FC<EvolutionChartProps> = ({ data, title, metrics }) => {
  const chartData = data.map(record => ({
    date: format(new Date(record.calculation_date), 'dd/MM/yy', { locale: ptBR }),
    consultation: `#${record.consultation_number}`,
    ...metrics.reduce((acc, metric) => ({
      ...acc,
      [metric.key]: Number(record[metric.key])
    }), {})
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="date" 
              className="text-xs"
              tick={{ fontSize: 11 }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fontSize: 11 }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
              labelStyle={{ fontWeight: 'bold', marginBottom: '8px' }}
            />
            <Legend 
              wrapperStyle={{ fontSize: '12px' }}
            />
            {metrics.map(metric => (
              <Line
                key={metric.key as string}
                type="monotone"
                dataKey={metric.key as string}
                name={metric.name}
                stroke={metric.color}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default EvolutionChart;
