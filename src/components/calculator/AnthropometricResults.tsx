
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info, Activity, Heart, Scale } from 'lucide-react';
import { calculateIMC, calculateRCQ, calculateBodyFatJacksonPollock, calculateLeanMass } from '@/utils/nutritionCalculations';

interface AnthropometricResultsProps {
  weight?: number;
  height?: number;
  age?: number;
  sex?: 'M' | 'F';
  waist?: number;
  hip?: number;
  sum3Folds?: number;
}

const AnthropometricResults: React.FC<AnthropometricResultsProps> = ({
  weight,
  height,
  age,
  sex,
  waist,
  hip,
  sum3Folds
}) => {
  if (!weight || !height) {
    return null;
  }

  const imc = calculateIMC(weight, height);
  
  // Classificação do IMC
  const getIMCClassification = (imc: number): { label: string; color: 'default' | 'secondary' | 'destructive' | 'outline' } => {
    if (imc < 18.5) return { label: 'Baixo peso', color: 'outline' };
    if (imc < 25) return { label: 'Peso normal', color: 'default' };
    if (imc < 30) return { label: 'Sobrepeso', color: 'secondary' };
    return { label: 'Obesidade', color: 'destructive' };
  };

  const imcClassification = getIMCClassification(imc);
  
  let rcq: number | null = null;
  if (waist && hip) {
    rcq = calculateRCQ(waist, hip);
  }

  let bodyFat: number | null = null;
  let leanMass: number | null = null;
  if (sum3Folds && age && sex) {
    bodyFat = calculateBodyFatJacksonPollock(sum3Folds, age, sex);
    leanMass = calculateLeanMass(weight, bodyFat);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Avaliação Antropométrica
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* IMC */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-blue-600" />
              <span className="font-medium">IMC (Índice de Massa Corporal)</span>
            </div>
            <Badge variant={imcClassification.color}>
              {imcClassification.label}
            </Badge>
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {imc} kg/m²
          </div>
          <div className="text-sm text-gray-600 mt-1">
            Peso: {weight}kg | Altura: {height}cm
          </div>
        </div>

        {/* RCQ */}
        {rcq && (
          <div className="bg-green-50 border border-green-100 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="h-4 w-4 text-green-600" />
              <span className="font-medium">RCQ (Relação Cintura-Quadril)</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {rcq}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Cintura: {waist}cm | Quadril: {hip}cm
            </div>
          </div>
        )}

        {/* Composição Corporal */}
        {bodyFat && leanMass && (
          <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Info className="h-4 w-4 text-purple-600" />
              <span className="font-medium">Composição Corporal (Jackson-Pollock)</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">% Gordura Corporal</div>
                <div className="text-xl font-bold text-purple-600">
                  {bodyFat}%
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Massa Magra</div>
                <div className="text-xl font-bold text-purple-600">
                  {leanMass}kg
                </div>
              </div>
            </div>
            
            <div className="text-sm text-gray-600 mt-2">
              Soma 3 dobras: {sum3Folds}mm | Idade: {age} anos
            </div>
          </div>
        )}

        {/* Instruções para medidas faltantes */}
        {(!waist || !hip || !sum3Folds) && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-600">
              <strong>Para cálculos completos, adicione:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                {!waist && <li>Medida da cintura (cm)</li>}
                {!hip && <li>Medida do quadril (cm)</li>}
                {!sum3Folds && <li>Soma das 3 dobras cutâneas (mm)</li>}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AnthropometricResults;
