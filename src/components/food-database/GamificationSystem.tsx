
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Trophy, Star, Target, Zap, Award, Crown, Gift } from 'lucide-react';

interface GamificationProps {
  userId: string;
  currentWeekData?: {
    mealPlansCompleted: number;
    targetCaloriesHit: number;
    varietyScore: number;
    sustainabilityChoices: number;
  };
}

const GamificationSystem: React.FC<GamificationProps> = ({
  userId,
  currentWeekData = {
    mealPlansCompleted: 5,
    targetCaloriesHit: 6,
    varietyScore: 8,
    sustainabilityChoices: 12
  }
}) => {
  const [userLevel, setUserLevel] = useState(3);
  const [experiencePoints, setExperiencePoints] = useState(1250);
  const [weeklyStreaks, setWeeklyStreaks] = useState(2);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [weeklyProgress, setWeeklyProgress] = useState<any[]>([]);

  useEffect(() => {
    loadUserProgress();
    calculateWeeklyProgress();
  }, [userId, currentWeekData]);

  const loadUserProgress = () => {
    // Mock achievements - in real implementation, load from database
    const mockAchievements = [
      {
        id: 'first_plan',
        title: 'Primeiro Plano',
        description: 'Criou seu primeiro plano alimentar',
        icon: Star,
        earned: true,
        points: 100
      },
      {
        id: 'week_streak',
        title: 'Consistência',
        description: 'Seguiu o plano por 7 dias consecutivos',
        icon: Target,
        earned: true,
        points: 200
      },
      {
        id: 'variety_master',
        title: 'Mestre da Variedade',
        description: 'Consumiu 15 grupos alimentares diferentes',
        icon: Crown,
        earned: false,
        points: 300,
        progress: 12,
        target: 15
      },
      {
        id: 'eco_warrior',
        title: 'Guerreiro Ecológico',
        description: 'Fez 20 escolhas sustentáveis',
        icon: Trophy,
        earned: false,
        points: 250,
        progress: 12,
        target: 20
      }
    ];

    setAchievements(mockAchievements);
  };

  const calculateWeeklyProgress = () => {
    const progress = [
      {
        id: 'meal_completion',
        title: 'Planos Seguidos',
        description: 'Seguir planos alimentares esta semana',
        icon: Target,
        current: currentWeekData.mealPlansCompleted,
        target: 7,
        points: 10,
        color: 'blue'
      },
      {
        id: 'calorie_accuracy',
        title: 'Meta Calórica',
        description: 'Atingir meta calórica diária',
        icon: Zap,
        current: currentWeekData.targetCaloriesHit,
        target: 7,
        points: 15,
        color: 'green'
      },
      {
        id: 'variety_score',
        title: 'Variedade Alimentar',
        description: 'Diversificar grupos alimentares',
        icon: Star,
        current: currentWeekData.varietyScore,
        target: 10,
        points: 20,
        color: 'purple'
      },
      {
        id: 'sustainability',
        title: 'Escolhas Sustentáveis',
        description: 'Optar por alimentos sustentáveis',
        icon: Award,
        current: currentWeekData.sustainabilityChoices,
        target: 15,
        points: 25,
        color: 'emerald'
      }
    ];

    setWeeklyProgress(progress);
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getLevelProgress = () => {
    const pointsForNextLevel = (userLevel + 1) * 500;
    const pointsForCurrentLevel = userLevel * 500;
    const progressPoints = experiencePoints - pointsForCurrentLevel;
    const requiredPoints = pointsForNextLevel - pointsForCurrentLevel;
    
    return (progressPoints / requiredPoints) * 100;
  };

  const getColorClass = (color: string) => {
    const colors: { [key: string]: string } = {
      blue: 'text-blue-600 bg-blue-50 border-blue-200',
      green: 'text-green-600 bg-green-50 border-green-200',
      purple: 'text-purple-600 bg-purple-50 border-purple-200',
      emerald: 'text-emerald-600 bg-emerald-50 border-emerald-200'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* User Level & XP */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <Crown className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Nível {userLevel}</h3>
              <p className="text-sm text-gray-600">{experiencePoints} XP</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso para o próximo nível</span>
              <span>{Math.round(getLevelProgress())}%</span>
            </div>
            <Progress value={getLevelProgress()} className="h-3" />
          </div>
          
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-white rounded-lg">
              <p className="text-2xl font-bold text-orange-600">{weeklyStreaks}</p>
              <p className="text-xs text-gray-600">Semanas Consecutivas</p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {achievements.filter(a => a.earned).length}
              </p>
              <p className="text-xs text-gray-600">Conquistas</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Challenges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Desafios da Semana
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {weeklyProgress.map((challenge) => {
              const IconComponent = challenge.icon;
              const percentage = getProgressPercentage(challenge.current, challenge.target);
              const isCompleted = percentage >= 100;
              
              return (
                <div 
                  key={challenge.id} 
                  className={`p-4 rounded-lg border ${getColorClass(challenge.color)} ${
                    isCompleted ? 'opacity-75' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <IconComponent className="h-5 w-5" />
                      <div>
                        <h4 className="font-medium text-sm">{challenge.title}</h4>
                        <p className="text-xs opacity-70">{challenge.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={isCompleted ? "default" : "secondary"}>
                        {isCompleted ? (
                          <><Trophy className="h-3 w-3 mr-1" /> Completo!</>
                        ) : (
                          `+${challenge.points} XP`
                        )}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{challenge.current} / {challenge.target}</span>
                      <span>{Math.round(percentage)}%</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            Conquistas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement) => {
              const IconComponent = achievement.icon;
              
              return (
                <div 
                  key={achievement.id}
                  className={`p-4 rounded-lg border transition-all ${
                    achievement.earned 
                      ? 'bg-yellow-50 border-yellow-200' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <IconComponent 
                      className={`h-6 w-6 ${
                        achievement.earned ? 'text-yellow-600' : 'text-gray-400'
                      }`} 
                    />
                    <div>
                      <h4 className="font-medium text-sm">{achievement.title}</h4>
                      <p className="text-xs text-gray-600">{achievement.description}</p>
                    </div>
                  </div>
                  
                  {achievement.earned ? (
                    <Badge variant="default" className="bg-yellow-600">
                      <Star className="h-3 w-3 mr-1" />
                      +{achievement.points} XP
                    </Badge>
                  ) : achievement.progress !== undefined ? (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>{achievement.progress} / {achievement.target}</span>
                        <span>{Math.round((achievement.progress / achievement.target) * 100)}%</span>
                      </div>
                      <Progress 
                        value={(achievement.progress / achievement.target) * 100} 
                        className="h-1" 
                      />
                    </div>
                  ) : (
                    <Badge variant="secondary">
                      {achievement.points} XP
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Reward Center */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-purple-600" />
            Centro de Recompensas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <Gift className="h-12 w-12 text-purple-400 mx-auto mb-3" />
            <h3 className="font-medium mb-2">Próxima Recompensa em 250 XP</h3>
            <p className="text-sm text-gray-600 mb-4">
              Desbloqueie análises nutricionais avançadas e relatórios personalizados!
            </p>
            <Button variant="outline" size="sm">
              Ver Todas as Recompensas
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GamificationSystem;
