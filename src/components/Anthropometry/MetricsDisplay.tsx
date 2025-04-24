
import React from 'react';

interface Metrics {
  imc: number | null;
  rcq: number | null;
  bodyFatPct: number | null;
  leanMassKg: number | null;
}

interface MetricsDisplayProps {
  metrics: Metrics;
}

const MetricsDisplay: React.FC<MetricsDisplayProps> = ({ metrics }) => {
  return (
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
  );
};

export default MetricsDisplay;
