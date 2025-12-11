/**
 * GAMIFICATION WIDGET
 * Compact widget for Dashboard showing user level, XP, and recent achievements
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trophy, Crown, Star, ChevronRight, Zap } from 'lucide-react';

interface GamificationWidgetProps {
  userId?: string;
}

const GamificationWidget: React.FC<GamificationWidgetProps> = ({ userId }) => {
  const navigate = useNavigate();

  // Mock data - in production, fetch from database
  const userLevel = 3;
  const experiencePoints = 1250;
  const weeklyStreak = 2;
  const achievementsCount = 5;
  const nextLevelXP = 2000;
  const levelProgress = ((experiencePoints - 1500) / (nextLevelXP - 1500)) * 100;

  const recentAchievements = [
    { id: '1', title: 'Primeiro Plano', icon: Star, earned: true },
    { id: '2', title: 'Consistência', icon: Trophy, earned: true },
  ];

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-purple-200/50 dark:border-purple-800/30">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
              <Trophy className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg">Sua Jornada</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/gamification')}
            className="text-primary"
          >
            Ver Tudo
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Level & XP */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
            <Crown className="h-7 w-7 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-lg">Nível {userLevel}</span>
              <span className="text-sm text-muted-foreground">{experiencePoints} XP</span>
            </div>
            <Progress value={Math.max(0, levelProgress)} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {nextLevelXP - experiencePoints} XP para o próximo nível
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-white/60 dark:bg-white/5 rounded-lg text-center">
            <div className="flex items-center justify-center gap-1 text-orange-600">
              <Zap className="h-4 w-4" />
              <span className="text-xl font-bold">{weeklyStreak}</span>
            </div>
            <p className="text-xs text-muted-foreground">Semanas seguidas</p>
          </div>
          <div className="p-3 bg-white/60 dark:bg-white/5 rounded-lg text-center">
            <div className="flex items-center justify-center gap-1 text-yellow-600">
              <Trophy className="h-4 w-4" />
              <span className="text-xl font-bold">{achievementsCount}</span>
            </div>
            <p className="text-xs text-muted-foreground">Conquistas</p>
          </div>
        </div>

        {/* Recent Achievements */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Conquistas Recentes</p>
          <div className="flex gap-2">
            {recentAchievements.map((achievement) => {
              const IconComponent = achievement.icon;
              return (
                <Badge 
                  key={achievement.id} 
                  variant="secondary"
                  className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 gap-1"
                >
                  <IconComponent className="h-3 w-3" />
                  {achievement.title}
                </Badge>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GamificationWidget;
