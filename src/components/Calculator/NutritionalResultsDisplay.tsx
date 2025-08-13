
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calculator, Target, Zap } from 'lucide-react';
import { ConsultationData } from '@/types';

interface NutritionalResultsDisplayProps {
  data: ConsultationData;
}

const NutritionalResultsDisplay: React.FC<NutritionalResultsDisplayProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Resultados Nutricionais
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Zap className="h-6 w-6 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold text-blue-800">{Math.round(data.bmr || 0)}</div>
            <div className="text-sm text-blue-600">TMB (kcal)</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Calculator className="h-6 w-6 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold text-green-800">{Math.round(data.tdee || 0)}</div>
            <div className="text-sm text-green-600">TDEE (kcal)</div>
          </div>
          
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-800">{Math.round(data.protein || 0)}g</div>
            <div className="text-sm text-orange-600">Proteína</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-800">{Math.round(data.carbs || 0)}g</div>
            <div className="text-sm text-purple-600">Carboidratos</div>
          </div>
        </div>
        
        <div className="mt-4 flex justify-center">
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-800">{Math.round(data.fats || 0)}g</div>
            <div className="text-sm text-red-600">Gorduras</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NutritionalResultsDisplay;
