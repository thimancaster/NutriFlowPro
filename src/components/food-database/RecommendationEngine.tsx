
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, TrendingUp, Target, Sparkles } from 'lucide-react';
import { searchFoodsByNutrition } from '@/integrations/supabase/functions';

interface RecommendationEngineProps {
  patientProfile?: {
    age: number;
    gender: string;
    activityLevel: string;
    goals: string[];
    restrictions: string[];
    preferences: string[];
  };
  currentMealPlan?: any;
  onFoodSelect?: (food: any) => void;
}

const RecommendationEngine: React.FC<RecommendationEngineProps> = ({
  patientProfile,
  currentMealPlan,
  onFoodSelect
}) => {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('protein');

  const recommendationCategories = [
    { 
      id: 'protein', 
      label: 'Alto em Proteína', 
      icon: Target,
      criteria: { minProtein: 15 }
    },
    { 
      id: 'lowcal', 
      label: 'Baixas Calorias', 
      icon: TrendingUp,
      criteria: { maxCalories: 100 }
    },
    { 
      id: 'fiber', 
      label: 'Rico em Fibras', 
      icon: Sparkles,
      criteria: { minFiber: 3 }
    },
    { 
      id: 'lowsodium', 
      label: 'Baixo Sódio', 
      icon: Brain,
      criteria: { maxSodium: 100 }
    }
  ];

  useEffect(() => {
    generateRecommendations();
  }, [activeCategory, patientProfile]);

  const generateRecommendations = async () => {
    setLoading(true);
    try {
      const category = recommendationCategories.find(c => c.id === activeCategory);
      if (category) {
        const foods = await searchFoodsByNutrition(category.criteria);
        
        // Apply personalized filtering based on patient profile
        let filteredFoods = foods;
        
        if (patientProfile?.restrictions) {
          filteredFoods = foods.filter(food => 
            !patientProfile.restrictions.some(restriction => 
              food.name.toLowerCase().includes(restriction.toLowerCase())
            )
          );
        }
        
        // Score and sort recommendations
        const scoredFoods = filteredFoods.map(food => ({
          ...food,
          score: calculateRecommendationScore(food, patientProfile)
        })).sort((a, b) => b.score - a.score);
        
        setRecommendations(scoredFoods.slice(0, 6));
      }
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateRecommendationScore = (food: any, profile?: any) => {
    let score = 0;
    
    // Base nutritional density score
    if (food.calories > 0) {
      score += (food.protein * 4 + food.fiber * 2) / food.calories * 10;
    }
    
    // Activity level adjustments
    if (profile?.activityLevel === 'high') {
      score += food.carbs * 0.1; // Higher carbs for active individuals
    }
    
    // Goal-based scoring
    if (profile?.goals?.includes('weight_loss')) {
      score += food.calories < 100 ? 5 : 0;
      score += food.fiber > 3 ? 3 : 0;
    }
    
    if (profile?.goals?.includes('muscle_gain')) {
      score += food.protein > 15 ? 5 : 0;
    }
    
    // Sustainability bonus
    if (food.sustainability_score > 7) {
      score += 2;
    }
    
    return Math.round(score * 10) / 10;
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-blue-600';
    if (score >= 4) return 'text-yellow-600';
    return 'text-gray-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          Recomendações Inteligentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          {recommendationCategories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(category.id)}
                className="flex items-center gap-2"
              >
                <IconComponent className="h-4 w-4" />
                {category.label}
              </Button>
            );
          })}
        </div>

        {/* Recommendations Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recommendations.map((food) => (
              <div
                key={food.id}
                className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onFoodSelect?.(food)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-sm">{food.name}</h4>
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${getScoreColor(food.score)}`}
                  >
                    {food.score}★
                  </Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                  <div>{food.calories} kcal</div>
                  <div>{food.protein}g prot</div>
                  <div>{food.fiber || 0}g fibra</div>
                </div>
                
                <div className="mt-2 text-xs text-gray-500">
                  {food.portion_size}{food.portion_unit}
                </div>
              </div>
            ))}
          </div>
        )}

        {recommendations.length === 0 && !loading && (
          <div className="text-center py-6 text-gray-500">
            <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Nenhuma recomendação encontrada para os critérios selecionados.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecommendationEngine;
