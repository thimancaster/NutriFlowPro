/**
 * FoodDatabase - Redirect to MealPlanBuilder
 * 
 * Esta página foi consolidada no MealPlanBuilder.
 * Este arquivo mantém compatibilidade com rotas existentes.
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const FoodDatabase = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redireciona para o MealPlanBuilder com aba de database aberta
    navigate('/meal-plan-builder?tab=database', { replace: true });
  }, [navigate]);

  return (
    <div className="container mx-auto py-8 text-center">
      <p className="text-muted-foreground">Redirecionando para o Construtor de Planos...</p>
    </div>
  );
};

export default FoodDatabase;
