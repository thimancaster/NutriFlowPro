/**
 * GAMIFICATION PAGE
 * Dedicated page for gamification system with achievements, challenges, and rewards
 */

import React from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/auth/AuthContext';
import GamificationSystem from '@/components/food-database/GamificationSystem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Gamification: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <Helmet>
        <title>Gamificação - NutriFlow Pro</title>
        <meta name="description" content="Acompanhe seu progresso, conquistas e desafios no NutriFlow Pro" />
      </Helmet>

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl">
            <Trophy className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Sistema de Gamificação</h1>
            <p className="text-muted-foreground">
              Acompanhe seu progresso e desbloqueie conquistas
            </p>
          </div>
        </div>
      </div>

      {/* Gamification Content */}
      {user?.id ? (
        <GamificationSystem 
          userId={user.id}
          currentWeekData={{
            mealPlansCompleted: 5,
            targetCaloriesHit: 6,
            varietyScore: 8,
            sustainabilityChoices: 12
          }}
        />
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Faça login para acessar o sistema de gamificação
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Gamification;
