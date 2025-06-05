
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Award, Leaf, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface FoodAnalysisProps {
  food: {
    id: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber?: number;
    sodium?: number;
    sugar?: number;
    saturated_fat?: number;
    glycemic_index?: number;
    sustainability_score?: number;
    allergens?: string[];
    portion_size: number;
    portion_unit: string;
  };
}

const NutritionalAnalysis: React.FC<FoodAnalysisProps> = ({ food }) => {
  const [nutritionalDensity, setNutritionalDensity] = useState<number>(0);

  useEffect(() => {
    loadNutritionalDensity();
  }, [food.id]);

  const loadNutritionalDensity = async () => {
    try {
      // Calculate a simple nutritional density based on protein, fiber and micronutrients
      const proteinScore = (food.protein / food.calories) * 100 || 0;
      const fiberScore = (food.fiber || 0) * 2;
      const micronutrientScore = food.sustainability_score || 5;
      
      const density = Math.min(100, (proteinScore + fiberScore + micronutrientScore) * 2);
      setNutritionalDensity(density);
    } catch (error) {
      console.error('Error calculating nutritional density:', error);
      setNutritionalDensity(0);
    }
  };

  // Prepare data for charts
  const macroData = [
    { name: 'Proteína', value: food.protein, color: '#EF4444' },
    { name: 'Carboidratos', value: food.carbs, color: '#F59E0B' },
    { name: 'Gorduras', value: food.fats, color: '#10B981' }
  ];

  const micronutrientData = [
    { name: 'Fibra', value: food.fiber || 0, recommended: 25, unit: 'g' },
    { name: 'Sódio', value: food.sodium || 0, recommended: 2300, unit: 'mg', warning: true },
    { name: 'Açúcar', value: food.sugar || 0, recommended: 50, unit: 'g', warning: true },
    { name: 'Gordura Saturada', value: food.saturated_fat || 0, recommended: 20, unit: 'g', warning: true }
  ];

  const getGlycemicIndexCategory = (gi?: number) => {
    if (!gi) return { category: 'Não informado', color: 'gray' };
    if (gi <= 55) return { category: 'Baixo', color: 'green' };
    if (gi <= 70) return { category: 'Moderado', color: 'yellow' };
    return { category: 'Alto', color: 'red' };
  };

  const getSustainabilityCategory = (score?: number) => {
    if (!score) return { category: 'Não avaliado', color: 'gray' };
    if (score >= 8) return { category: 'Excelente', color: 'green' };
    if (score >= 6) return { category: 'Bom', color: 'blue' };
    if (score >= 4) return { category: 'Regular', color: 'yellow' };
    return { category: 'Baixo', color: 'red' };
  };

  const getNutritionalDensityCategory = (density: number) => {
    if (density >= 75) return { category: 'Excelente', color: 'green' };
    if (density >= 50) return { category: 'Bom', color: 'blue' };
    if (density >= 25) return { category: 'Regular', color: 'yellow' };
    return { category: 'Baixo', color: 'red' };
  };

  const glycemicData = getGlycemicIndexCategory(food.glycemic_index);
  const sustainabilityData = getSustainabilityCategory(food.sustainability_score);
  const densityData = getNutritionalDensityCategory(nutritionalDensity);

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {food.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{food.calories}</div>
              <div className="text-sm text-gray-500">kcal por {food.portion_size}{food.portion_unit}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{food.protein}g</div>
              <div className="text-sm text-gray-500">Proteína</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">{food.carbs}g</div>
              <div className="text-sm text-gray-500">Carboidratos</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{food.fats}g</div>
              <div className="text-sm text-gray-500">Gorduras</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Macronutrient Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Macronutrientes</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={macroData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {macroData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}g`, 'Quantidade']} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Micronutrients */}
      <Card>
        <CardHeader>
          <CardTitle>Micronutrientes e Componentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {micronutrientData.map((nutrient) => {
              const percentage = Math.min((nutrient.value / nutrient.recommended) * 100, 100);
              return (
                <div key={nutrient.name}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">{nutrient.name}</span>
                    <span className="text-sm text-gray-600">
                      {nutrient.value}{nutrient.unit} / {nutrient.recommended}{nutrient.unit}
                    </span>
                  </div>
                  <Progress 
                    value={percentage} 
                    className={`h-2 ${nutrient.warning && percentage > 50 ? 'bg-red-100' : 'bg-green-100'}`}
                  />
                  {nutrient.warning && percentage > 50 && (
                    <div className="flex items-center gap-1 mt-1">
                      <AlertTriangle className="h-3 w-3 text-yellow-600" />
                      <span className="text-xs text-yellow-600">Alto teor de {nutrient.name.toLowerCase()}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quality Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Nutritional Density */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Award className="h-4 w-4" />
              Densidade Nutricional
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className={`text-2xl font-bold text-${densityData.color}-600`}>
                {nutritionalDensity.toFixed(1)}%
              </div>
              <Badge variant={densityData.color === 'green' ? 'default' : 'secondary'}>
                {densityData.category}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Glycemic Index */}
        {food.glycemic_index && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Índice Glicêmico</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className={`text-2xl font-bold text-${glycemicData.color}-600`}>
                  {food.glycemic_index}
                </div>
                <Badge variant={glycemicData.color === 'green' ? 'default' : 'secondary'}>
                  {glycemicData.category}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sustainability */}
        {food.sustainability_score && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Leaf className="h-4 w-4" />
                Sustentabilidade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className={`text-2xl font-bold text-${sustainabilityData.color}-600`}>
                  {food.sustainability_score}/10
                </div>
                <Badge variant={sustainabilityData.color === 'green' ? 'default' : 'secondary'}>
                  {sustainabilityData.category}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Allergens */}
      {food.allergens && food.allergens.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              Alérgenos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {food.allergens.map((allergen) => (
                <Badge key={allergen} variant="outline" className="text-red-600 border-red-600">
                  {allergen}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NutritionalAnalysis;
